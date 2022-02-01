import { downloadAndProcessPDF } from "../pdf.js";
import { assert } from 'chai';
import fs from 'fs'

const EXAMPLE_URL = 'https://disclosures-clerk.house.gov/public_disc/financial-pdfs/2010/8144403.pdf';

describe('pdf.js/ downloadAndProcessPDF()', () => {
    let result = downloadAndProcessPDF({disclosureURL: EXAMPLE_URL})

    it('Should not fail', async () => {
        return result
    })


    it('Errors out when given a bad url', (done) => {
        downloadAndProcessPDF("").catch((e) => {
            done()
        })
    })

    it('Contains pdf path and image buffers', async () => {
        let pdfHandle = await result;
        assert.hasAllKeys(pdfHandle, ["pdf", "images"])

        assert.isArray(pdfHandle.images)

        pdfHandle.images.forEach(image => {
            assert.hasAllKeys(image, ['path', 'buffer'])
        })
    })

    it('All Paths are valid', async () => {
        let pdfHandle = await result;
        let pdfPath = pdfHandle.pdf;
        let imagePaths = pdfHandle.images.map(image => {
            return image.path;
        })

        
        let fileStats = getFileStats(pdfPath)

        let imageStats = imagePaths.map(path=>{
            return getFileStats(path)
        })
        
        
        assert.ok(await fileStats, "PDF should exist")

        imageStats = await Promise.all(imageStats)

        imageStats.forEach(stat=>{
            assert.ok(stat, "All generated JPG files should exist")
        })

    })

})

function getFileStats(path)
{
    let fileStats = new Promise((resolve, reject) => {
        fs.stat(path, (err, stat) => {
            if (err) {
                reject()
            }
            else {
                resolve(stat)
            }
        })
    })
    return fileStats
}