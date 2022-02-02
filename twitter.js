import 'dotenv/config'
import Twitter from 'twitter'
import { promises as fs } from 'fs'


const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

/*
client.post('statuses/update',{status: "Hello World! from nodeJS"},(e,data)=>{
    if(e)
    {
        console.log(e)
    }
    console.log(data)
})*/


async function sendTweet(record) {
    // Build text response
    // Send pictures

    let buffer = await fs.readFile('./test.jpg')
    console.log(buffer)
    let mediaIds = await uploadPhotos([buffer])

    client.post('statuses/update', { media_ids: mediaIds[0].media_id_string, status: "This is a photo of a duck" }, (e, data) => {
        console.log(e, data)
    })
}

async function uploadPhotos(buffers) {
    buffers = buffers.map(async buffer => {
        // Get name
        return new Promise((resolve, reject) => {
            client.post('media/upload', { media: buffer }, (e, media, response) => {
                if (e) {
                    reject(e)
                }
                else if (media) {
                    console.log(media)
                    resolve(media)
                }
            })
        })
    })

    let mediaIds = await Promise.all(buffers)
    return mediaIds
}

sendTweet("e");
