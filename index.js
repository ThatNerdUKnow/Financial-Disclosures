import puppeteer from 'puppeteer';
import { paginateAndScrape } from './scraper.js'
import { SEARCH_LINK_SELECTOR, SEARCH_TABLE_SELECTOR, SUBMIT_BUTTON_SELECTOR } from './globals.js'
import { promises as fs } from 'fs'
import _ from 'lodash'
import {downloadAndProcessPDF} from './pdf.js'
import os from 'os'



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

    let latestRecords = await paginateAndScrape();

    latestRecords = _.keyBy(latestRecords, (o) => {
        return o.disclosureURL
    })

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

    // Get number of cpu cores on host
    const CORES = os.cpus().length

    // Convert newRecords to array
    newRecords = Object.values(newRecords);

    // Split newRecords into chunks of size (how many cores the system has)
    newRecords = _.chunk(newRecords,CORES)

    await newRecords.reduce(async(memo,chunk)=>{
        await memo
        await Promise.all(chunk.map(async record=>{
            await downloadAndProcessPDF(record)
        }))
    },undefined)

   
    // Post to Twitter*/

    
}

getFinancialDisclosures()
setInterval(getFinancialDisclosures,3600000)