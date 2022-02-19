import 'dotenv/config'
import Twitter from 'twitter'
import { promises as fs } from 'fs'
import _ from 'lodash'
import path from 'path'
import states from './states.js'

const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

export async function sendTweet(record) {

    // I know this looks like garbage
    // What this line does is extract each media id string from record.media_ids
    // And then chunks them into groups of four since we can only attach four photos per tweet
    let media_chunks = _.chunk(record.media_ids.map(media => {
        return media.media_id_string
    }), 4)

    // Wait for all tweets
    console.log(`Posting to Twitter`)
    await Promise.all(media_chunks.map(async (media_ids, i) => {
        let status = { status: "" }
        status.media_ids = media_ids.toString()
        let isMultiPart = (media_chunks.length > 1) ? true : false

        if (isMultiPart) {
            status.status = `[${i + 1}/${media_chunks.length}]\n`
        }

        let state = getStateFromCode(record.office);

        status.status += `
        ${record.name}\n
        ${record.year}\n
        Office: #${record.office}\n
        Filing Type: ${record.filing}\n
        ${state ? "#" + state : ""} #usa #congress #financialdisclosure`;

        return new Promise((resolve, reject) => {
            client.post('statuses/update', status, (e, data) => {
                if (e) {
                    reject(e)
                }
                else if (data) {
                    resolve(data)
                }
            })
        })
    }))
    console.log('Posted to twitter')
}

export async function uploadPhotos(images) {
    let buffers = images.map(async image => {
        return new Promise((resolve, reject) => {
            client.post('media/upload', { media: image.buffer }, (e, media) => {
                if (e) {
                    reject(e)
                }
                else if (media) {
                    resolve(media)
                }
            })
        })
    })

    let mediaIds = await Promise.all(buffers)
    return mediaIds
}


export async function postDisclosure(record) {
    console.log(record)
    //let buffers = record.pdfRecord.images;
    let paths = record.pdfRecord.files.map(x => { return x })
    paths.push(record.pdfRecord.pdf)

    let buffers = await readImageBuffers(record.pdfRecord.files)
    cleanupSideEffects(paths)
    record.media_ids = await uploadPhotos(buffers).catch(e => { console.warn(e) })
    let tweet = await sendTweet(record).catch(e => { console.warn(e) })
    record = null
    return tweet;
}

async function readImageBuffers(paths) {

    // For each file, read and return the buffer data along with the path
    let images = await Promise.all(paths.map(async file => {
        console.log(`Reading ${file} buffer data`)
        const contents = await fs.readFile(file)
        return { path: file, buffer: contents }
    }))

    // Since we read the files asynchonously, Reorder the files
    images = _.orderBy(images, (image) => {
        let regex = /\d*.jpg/
        let res = image.path.match(regex)[0]
        res = path.basename(res, '.jpg')
        return res
    })

    return images
}

async function cleanupSideEffects(paths) {
    paths.forEach(path => {
        console.log(`Deleting ${path}`)
        fs.rm(path)
    })
}

function getStateFromCode(office) {
    let stateCode = office.slice(0, 2);
    return states[stateCode];
}
