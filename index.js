import puppeteer from 'puppeteer';
import {paginateAndScrape} from './scraper.js'
import {SEARCH_LINK_SELECTOR,SEARCH_TABLE_SELECTOR,SUBMIT_BUTTON_SELECTOR} from './globals.js'

const url = 'https://disclosures-clerk.house.gov/PublicDisclosure/FinancialDisclosure';

(async () => {
    console.log("Launching Browser")
    const browser = await puppeteer.launch({ defaultViewport: { width: 1920, height: 1080 },
    headless: false });
    console.log("Getting Page")
    const page = await browser.newPage();
    console.log(`Navigating to ${url}`)
    await page.goto(url, { waitUntil: 'networkidle2' });

    console.log("Getting to disclosure list");
    await page.click(SEARCH_LINK_SELECTOR)
    
    console.log("Waiting for search form")
    await page.waitForSelector(SUBMIT_BUTTON_SELECTOR)

    await page.click(SUBMIT_BUTTON_SELECTOR)
    

    console.log("Waiting for disclosure list to show up")


    await page.waitForSelector(SEARCH_TABLE_SELECTOR, { visible: true })
    console.log("Disclosure list populated")

    await page.screenshot({ path: "./sc.png" })
    await paginateAndScrape(page,SEARCH_TABLE_SELECTOR);


    //await browser.close();


})()