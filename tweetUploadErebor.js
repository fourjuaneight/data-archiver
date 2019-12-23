#!/usr/bin / env node

const { resolve } = require('path');
const axios = require('axios');
const dotenv = require('dotenv').config({
  path: resolve(process.cwd(), '.env'),
});

axios({
  data: {
    query: `
          mutation TweetMutation {
            insert_tweets(objects: {
              id: "${obj.id}",
              tweet: "${obj.tweet}",
              date: "${obj.date}",
              retweet: "${obj.retweet}",
              retweeted: "${obj.retweeted}",
              favorited: "${obj.favorited}",
              created_at: "${obj.date}",
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
  .then(result => console.info(result.data)) // eslint-disable-line
  .catch(err => console.error(err));
