import 'dotenv/config'
import Twitter from 'twitter-v2'

let creds = {
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
}
const client = new Twitter(creds)

console.log(creds)
//const { data } = await client.get('tweets', { ids: '1228393702244134912' });
const tweet = await client.post('tweets', {text: "Hello World! -nodeJS"}).catch(e => { console.log(e) })
//console.log(data);
console.log(tweet)