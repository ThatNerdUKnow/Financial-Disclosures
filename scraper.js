import { SEARCH_TABLE_SELECTOR, PAGINATOR_SELECTOR } from "./globals.js"

export async function paginateAndScrape(page) {
    console.log("Enumerating every Financial Disclosure Document")

    await page.waitForSelector(PAGINATOR_SELECTOR);

    let currentPage = 1;
    let lastPage = await getLastPage(page);

    let records = [];

    while(currentPage <= lastPage)
    {
    process.stdout.write(`Enumerating records on page ${currentPage} of ${lastPage}\r`)
    let pageRecords = await getEveryRecordOnPage(page)
    records = records.concat(pageRecords);
    await advancePage(page)
    currentPage +=1;
    }

    
}

async function getEveryRecordOnPage(page) {

    let recordsOnPage = await page.evaluate((SEARCH_TABLE_SELECTOR) => {
        let records = [];
        let recordsPage = document.querySelectorAll(SEARCH_TABLE_SELECTOR + ' tr.odd,.even')

        recordsPage.forEach(record => {
            let fields = record.querySelectorAll('td');

            let name = fields[0].innerText;
            let office = fields[1].innerText;
            let year = fields[2].innerText;
            let filing = fields[3].innerText;
            let disclosureURL = fields[0].querySelector('a').href;

            records.push({
                name,
                office,
                year,
                filing,
                disclosureURL,
            })
        })
        return records;
    }, SEARCH_TABLE_SELECTOR)
    return recordsOnPage;
}

async function advancePage(page) {

    let nextSelector = PAGINATOR_SELECTOR + " a.next"

    await page.evaluate((selector)=>{
        document.querySelector(selector).click()
    },nextSelector)

}

async function getLastPage(page)
{
    let lastSelector = PAGINATOR_SELECTOR + " span a"
    let last = await page.evaluate((selector)=>{
        let last = document.querySelectorAll(selector)[5].innerText;
        return last
    },lastSelector)
    return last
}