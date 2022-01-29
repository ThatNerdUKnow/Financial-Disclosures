import im from 'imagemagick'
import { promises as fs } from 'fs'
import path from 'path'
import _ from 'lodash'
import axios from 'axios'
import { v4 as uuid } from 'uuid'
import { createHmac } from "crypto"

(async () => {
    await downloadAndProcessPDF('https://disclosures-clerk.house.gov/public_disc/ptr-pdfs/2022/20020208.pdf')
})()

async function processPDF(pdfPath) {
    let basename = path.basename(pdfPath, '.pdf')
    let outputPath = "./img/" + basename + ".jpg";

    console.log(`Converting ${pdfPath}`)

    im.convert(["-density", 300, pdfPath, outputPath], async (err) => {

        if (err) {
            console.log(err)
            throw `Couldn't Process ${pdfPath}`
        }
        else {


            let files = await fs.readdir(`./img/`)

            files = files.map(file => {
                return "./img/" + file
            })

            files = files.filter((file) => {
                return file.includes(basename)
            })

            console.log("Reading Image Data")

            let images = await Promise.all(files.map(async file => {
                const contents = await fs.readFile(file)
                return { path: file, buffer: contents }
            }))

            images = _.orderBy(images, (image) => {
                let regex = /\d*.jpg/
                let res = image.path.match(regex)[0]
                res = path.basename(res, '.jpg')
                return res
            })

            let output = { pdf: pdfPath, images }
            return output
        }
    })
}

async function downloadAndProcessPDF(url) {
    let { data } = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/pdf'
        }
    })
    let id = "./pdf/" + uuid() + ".pdf"
    await fs.writeFile(id, data);
    let pdfData = await processPDF(id);
    console.log(pdfData)
}