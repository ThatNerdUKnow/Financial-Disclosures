import puppeteer from 'puppeteer';
import { paginateAndScrape } from './scraper.js'
import { SEARCH_LINK_SELECTOR, SEARCH_TABLE_SELECTOR, SUBMIT_BUTTON_SELECTOR } from './globals.js'
import { promises as fs } from 'fs'
import _ from 'lodash'
import {downloadAndProcessPDF} from './pdf.js'

const url = 'https://disclosures-clerk.house.gov/PublicDisclosure/FinancialDisclosure';

async function getFinancialDisclosures() {

    console.log("Loading Records")

    let records = await fs.readFile('./records.json').catch(e => {
        console.log("Couldn't load previous records, Starting new")
        return {}
    })

    try
    {
    records = JSON.parse(records);
    }
    catch(e)
    {
        console.log(e)
    }
    
    

    console.log("Launching Browser")
    const browser = await puppeteer.launch({
        defaultViewport: { width: 1920, height: 1080 },
        headless: true
    });
    console.log("Getting Page Context")
    const page = await browser.newPage();
    console.log(`Navigating to ${url}`)
    await page.goto(url, { waitUntil: 'networkidle2' });

    await navigateToForm(page)

    let latestRecords = await paginateAndScrape(page, SEARCH_TABLE_SELECTOR);
    browser.close();

    latestRecords = _.keyBy(latestRecords, (o) => {
        return o.disclosureURL
    })

    console.log('')
    console.log("Writing to FS")
    await fs.writeFile('./records.json', JSON.stringify(latestRecords))

    
    let newRecords = _.pickBy(latestRecords, record => {
        
        
        if (records[record.disclosureURL]) {
            
            return false
        }
        else {
            return true
        }
    })

    
    // Image Processing

    
    for(let record in newRecords)
    {
        // Download PDF and Process into seperate JPEGs
        await downloadAndProcessPDF(record)
    }

    // Post to Twitter*/

    
}

async function navigateToForm(page) {
    console.log("Getting to disclosure list");
    await page.click(SEARCH_LINK_SELECTOR)

    console.log("Waiting for search form")
    await page.waitForSelector(SUBMIT_BUTTON_SELECTOR)

    await page.click(SUBMIT_BUTTON_SELECTOR)


    console.log("Waiting for render")


    await page.waitForSelector(SEARCH_TABLE_SELECTOR, { visible: true, timeout: 0 })
    console.log("Disclosure list populated")
}

getFinancialDisclosures()
setInterval(getFinancialDisclosures,3600000)