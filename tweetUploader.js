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
const pushcut =
  typeof dotenv.parsed !== 'undefined'
    ? dotenv.parsed.PUSHCUT_ENDPOINT
    : argv.n;
const key =
  typeof dotenv.parsed !== 'undefined' ? dotenv.parsed.TWITTER_KEY : argv.k;
const secret =
  typeof dotenv.parsed !== 'undefined' ? dotenv.parsed.TWITTER_SECRET : argv.s;

const getLastTweet = auth(key, secret)
  .then(token =>
    lastTweet(token)
      .then(tweet => tweet)
      .catch(err =>
        axios.post(pushcut, {
          title: 'Error getting last Tweet',
          text: err,
        })
      )
  )
  .catch(err =>
    axios.post(pushcut, {
      title: 'Error getting Twitter Bearer Token',
      text: err,
    })
  );

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
            axios.post(pushcut, {
              title: 'Save new Tweet to Erebor',
              text: result.data.data.insert_tweets.returning,
            })
          )
          .catch(err =>
            axios.post(pushcut, {
              title: 'Error uploading to Erebor',
              text: err.response,
            })
          );
      } else {
        console.info('No new tweets to upload'); // eslint-disable-line
      }
    })
    .catch(err =>
      axios.post(pushcut, {
        title: 'Error getting Tweets from Erebor',
        text: err.response,
      })
    );
});
