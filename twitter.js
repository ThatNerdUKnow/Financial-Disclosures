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

const duckPaths = ['./duck1.jpg', './duck2.jpg', 'duck3.jpg', 'duck4.jpg', 'duck5.jpg', 'duck6.jpg', 'duck7.jpg']

let buffers = await Promise.all(duckPaths.map(async duck => {
    return fs.readFile(duck);
}))

let tweetThis = {}
tweetThis.media_ids = await uploadPhotos(buffers)

sendTweet(tweetThis)

export async function sendTweet(record) {
    // Build text response
    // Send pictures

    // I know this looks like garbage
    // What this line does is extract each media id string from record.media_ids
    // And then chunks them into groups of four since we can only attach four photos per tweet
    let media_chunks = _.chunk(record.media_ids.map(media => { return media.media_id_string }), 4)

    await Promise.all(media_chunks.map(async (media_ids, i) => {
        let status = {}
        status.media_ids = media_ids.toString()
        let isMultiPart = (media_chunks.length > 1) ? true : false

        if (isMultiPart) {
            status.status = `[${i + 1}/${media_chunks.length}]\n`
        }
        else {
            status.status = "Nothing to see here\n"
        }

        status.status += "Nothing to see here"
        console.log(status)

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

    /*
    client.post('statuses/update', status, (e, data) => {
        console.log(e, data)
    })*/
}

export async function uploadPhotos(buffers) {
    buffers = buffers.map(async buffer => {
        // Get name
        return new Promise((resolve, reject) => {
            client.post('media/upload', { media: buffer }, (e, media, response) => {
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
