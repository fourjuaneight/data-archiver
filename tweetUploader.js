const { resolve } = require('path');
const argv = require('minimist')(process.argv.slice(2));
const axios = require('axios');
const dotenv = require('dotenv').config({
  path: resolve(process.cwd(), '.env'),
});
const { auth, ereborTweet, lastTweet } = require('./util/twitter');

const endpoint =
  typeof dotenv.parsed !== 'undefined' ? dotenv.parsed.EREBOR_ENDPOINT : argv.e;
const password =
  typeof dotenv.parsed !== 'undefined' ? dotenv.parsed.EREBOR_KEY : argv.p;
const key =
  typeof dotenv.parsed !== 'undefined' ? dotenv.parsed.TWITTER_KEY : argv.k;
const secret =
  typeof dotenv.parsed !== 'undefined' ? dotenv.parsed.TWITTER_SECRET : argv.s;

const getLastTweet = auth(key, secret)
  .then(token =>
    lastTweet(token)
      .then(tweet => tweet)
      .catch(err => {
        throw new Error(err);
      })
  )
  .catch(err => {
    throw new Error(err);
  });

getLastTweet.then(tweet => {
  ereborTweet(endpoint, tweet[0].id, password)
    .then(results => {
      if (!results) {
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
          .then(result =>
            console.info(result.data.data.insert_tweets.returning)
          ) // eslint-disable-line
          .catch(err => {
            throw new Error('Erebor:', err.response.status);
          });
      } else {
        console.info('No new tweets to upload'); // eslint-disable-line
      }
    })
    .catch(err => {
      throw new Error('Erebor:', err.response.status);
    });
});
