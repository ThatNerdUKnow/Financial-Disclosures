import { downloadAndProcessPDF } from "../pdf.js";
import assert from 'assert';

const EXAMPLE_URL = 'https://disclosures-clerk.house.gov/public_disc/financial-pdfs/2010/8144403.pdf';

describe('pdf.js/ downloadAndProcessPDF()',()=>{
    it('Should return a value',(done)=>{
        downloadAndProcessPDF(EXAMPLE_URL).then((value)=>{
            console.log("TEST")
            assert.ok(value)
            done()
        })
    })
})