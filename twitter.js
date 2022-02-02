import 'dotenv/config'
import Twitter from 'twitter'
import { promises as fs } from 'fs'
import _ from 'lodash'


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
        let status = {status: ""}
        status.media_ids = media_ids.toString()
        let isMultiPart = (media_chunks.length > 1) ? true : false

        if (isMultiPart) {
            status.status = `[${i + 1}/${media_chunks.length}]\n`
        }

        //status.status += "Nothing to see here"

        status.status += `${record.name}\n${record.year}\n${record.office}\nFiling Type: ${record.filing}`
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
    let buffers = record.pdfRecord.images;
    record.media_ids = await uploadPhotos(buffers)
    return await sendTweet(record)
}