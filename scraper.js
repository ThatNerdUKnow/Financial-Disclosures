import { SEARCH_TABLE_SELECTOR, PAGINATOR_SELECTOR, SEARCH_LINK_SELECTOR, SUBMIT_BUTTON_SELECTOR } from "./globals.js"
import puppeteer from 'puppeteer'

export async function paginateAndScrape(pageDeprecated) {

    let { browser, page } = await preflight()

    console.log("Enumerating every Financial Disclosure Document")

    await page.waitForSelector(PAGINATOR_SELECTOR);

    let currentPage = 1;
    let lastPage = await getLastPage(page);

    let records = [];

    while (currentPage <= lastPage) {
        // process.stdout.write(`Processing page ${currentPage} of ${lastPage}\r`)
        let pageRecords = await getEveryRecordOnPage(page)
        records = records.concat(pageRecords);
        await advancePage(page)
        currentPage += 1;
    }

    browser.close();
    return records;

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

    await page.evaluate((selector) => {
        document.querySelector(selector).click()
    }, nextSelector)

}

async function getLastPage(page) {
    let lastSelector = PAGINATOR_SELECTOR + " span a"
    let last = await page.evaluate((selector) => {
        let last = document.querySelectorAll(selector)[5].innerText;
        return last
    }, lastSelector)
    return last
}

async function preflight() {

    const url = 'https://disclosures-clerk.house.gov/PublicDisclosure/FinancialDisclosure';

    console.log("Launching Browser")
    const browser = await puppeteer.launch({
        defaultViewport: { width: 1920, height: 1080 },
        headless: true
    });

    console.log("Getting Page Context")
    const page = await browser.newPage();
    console.log(`Navigating to ${url}`)
    await page.goto(url, { waitUntil: 'networkidle2' });

    console.log("Getting to disclosure list");
    await page.click(SEARCH_LINK_SELECTOR)

    console.log("Waiting for search form")
    await page.waitForSelector(SUBMIT_BUTTON_SELECTOR)

    await page.click(SUBMIT_BUTTON_SELECTOR)


    console.log("Waiting for render")


    await page.waitForSelector(SEARCH_TABLE_SELECTOR, { visible: true, timeout: 0 })
    console.log("Disclosure list populated")

    return { page, browser };
}