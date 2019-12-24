const { resolve } = require('path');
const axios = require('axios');
const dotenv = require('dotenv').config({
  path: resolve(process.cwd(), '.env'),
});
const lastTweet = require('./util/lastTweet');

lastTweet.then(
  tweet =>
    axios({
      data: {
        query: `
          mutation TweetMutation {
            insert_tweets(objects: {
              id: "${tweet[0].id}",
              tweet: "${tweet[0].tweet}",
              date: "${tweet[0].date}",
              retweet: "${tweet[0].retweet}",
              retweeted: "${tweet[0].retweeted}",
              favorited: "${tweet[0].favorited}",
              created_at: "${tweet[0].date}",
            }) {
              returning {
                tweet
                id
              }
            }
          }
        `,
      },
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': dotenv.parsed.EREBOR_KEY,
      },
      method: 'POST',
      url: dotenv.parsed.EREBOR_ENDPOINT,
    })
      .then(result => console.info(result.data.data.insert_tweets.returning)) // eslint-disable-line
      .catch(err => console.error('Erebor:', err.response.status)) // eslint-disable-line
);
