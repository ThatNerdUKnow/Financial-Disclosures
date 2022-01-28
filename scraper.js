import { SEARCH_TABLE_SELECTOR, PAGINATOR_SELECTOR } from "./globals.js"

export async function paginateAndScrape(page) {
    console.log("Enumerating every Financial Disclosure Document")

    await page.waitForSelector(PAGINATOR_SELECTOR);
    let paginator = await page.$(PAGINATOR_SELECTOR);
    await paginator.screenshot({ path: './paginator.png' })
    await getEveryRecordOnPage(page)
    await advancePage(paginator)

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

        console.log(records)
        return records;



    }, SEARCH_TABLE_SELECTOR)

    return recordsOnPage;

}

async function advancePage(paginator) {

    let nextButton = await paginator.$('.next')
    await nextButton.click()

}