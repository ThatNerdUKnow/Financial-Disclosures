import { paginateAndScrape } from "../scraper.js";
import _ from 'lodash';
import { assert } from 'chai';

describe("scraper.js:", async () => {
    let result = paginateAndScrape()
    it('Should not fail', async () => {
        return result
    })

    it('Should return a list of Records', async () => {
        let records = await result;

        let recordValues = _.values(records)

        recordValues.forEach(record => {
            assert.hasAllKeys(record, ["name", "office", "year", "filing", "disclosureURL"])
        })


    })
})