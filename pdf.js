import im from 'imagemagick'
import { promises as fs } from 'fs'
import path from 'path'
import _ from 'lodash'
import axios from 'axios'
import { v4 as uuid } from 'uuid'

async function processPDF(pdfPath) {
    let basename = path.basename(pdfPath, '.pdf')
    let outputPath = "./config/img/" + basename + ".jpg";

    console.log(`Converting ${pdfPath}`)


    // Promisify the callback of im.convert()
    let images = await new Promise((resolve, reject) => {

        // Take PDF file and generate individual JPG files
        im.convert(["-density", 300, "-quality", 80, pdfPath, outputPath], async (err) => {

            if (err) {
                console.log(err)
                reject(err)
                throw `Couldn't Process ${pdfPath}`
            }
            else {

                // Get every file in Temporary Image Directory
                let files = await fs.readdir(`./config/img/`)

                // Append directory into filenames
                files = files.map(file => {
                    return "./config/img/" + file
                })

                // We only want the files that match the source pdf's name
                files = files.filter((file) => {
                    return file.includes(basename)
                })

                //console.log(`Getting ${basename} Buffer Data`)

                /*// For each file, read and return the buffer data along with the path
                let images = await Promise.all(files.map(async file => {
                    const contents = await fs.readFile(file)
                    return { path: file, buffer: contents }
                }))

                // Since we read the files asynchonously, Reorder the files
                images = _.orderBy(images, (image) => {
                    let regex = /\d*.jpg/
                    let res = image.path.match(regex)[0]
                    res = path.basename(res, '.jpg')
                    return res
                })*/

                let output = { pdf: pdfPath, files }

                resolve(output)
            }
        })
    })
    return images
}

/**
 * 
 * @param {Disclosure} record - A disclosure record from the house
 * @returns {Object} - {pdf: String, images: { path: String, buffer: Buffer}}
 */
export async function downloadAndProcessPDF(record) {

    let url = record.disclosureURL;

    // Fetch PDF from server
    let { data } = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/pdf'
        }
    }).catch(e => {
        console.log(e);
        throw `Can't retrieve ${url}`
    })

    // Generate a Unique ID for the pdf since this is called asynchronously, this will be called many times simultaneously
    let id = "./config/pdf/" + uuid() + ".pdf"
    await fs.writeFile(id, data);

    // tell processPDF to process the pdf in the ./pdf directory with the given filename
    let pdfData = await processPDF(id);

    return pdfData
}