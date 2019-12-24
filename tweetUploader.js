const { resolve } = require('path');
const argv = require('minimist')(process.argv.slice(2));
const axios = require('axios');
const dotenv = require('dotenv').config({
  path: resolve(process.cwd(), '.env'),
});
const { auth, getTweet } = require('./util/twitter');

const ereborEndpoint = dotenv.parsed.EREBOR_ENDPOINT;
const ereborKey = dotenv.parsed.EREBOR_KEY;
const twtKey = dotenv.parsed.TWITTER_KEY;
const twtSecret = dotenv.parsed.TWITTER_SECRET;

const endpoint = typeof ereborKey !== 'undefined' ? ereborKey : argv.e;
const key = typeof twtKey !== 'undefined' ? twtKey : argv.k;
const password =
  typeof ereborEndpoint !== 'undefined' ? ereborEndpoint : argv.p;
const secret = typeof twtSecret !== 'undefined' ? twtSecret : argv.s;

const lastTweet = auth(key, secret)
  .then(token =>
    getTweet(token)
      .then(tweet => tweet)
      .catch(err => {
        throw new Error(err);
      })
  )
  .catch(err => {
    throw new Error(err);
  });

lastTweet.then(tweet =>
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
      'X-Hasura-Admin-Secret': password,
    },
    method: 'POST',
    url: endpoint,
  })
    .then(result => console.info(result.data.data.insert_tweets.returning)) // eslint-disable-line
    .catch(err => {
      throw new Error('Erebor:', err.response.status);
    })
);
