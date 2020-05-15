require('dotenv').config();
const process = require('process');
const axios = require('axios');
const { auth } = require('./auth');
const { latest } = require('./latest');

const getLastTweet = auth(process.env.TWITTER_KEY, process.env.TWITTER_SECRET)
  .then(token =>
    latest(token)
      .then(tweet => tweet)
      .catch(err => {
        console.error('Latest Tweets:', err);
        process.exitCode = 1;
      })
  )
  .catch(err => {
    console.error('Twitter Auth:', err);
    process.exitCode = 1;
  });

getLastTweet.then(tweets => {
  if (tweets.length > 0) {
    // eslint-disable-next-line no-restricted-syntax
    for (const tweet of tweets) {
      axios({
        data: {
          query: `
              mutation TweetMutation {
                insert_tweets(objects: {
                  id: "${tweet.id}",
                  tweet: "${tweet.tweet}",
                  date: "${tweet.date}",
                  retweet: "${tweet.retweet}",
                  retweeted: "${tweet.retweeted}",
                  favorited: "${tweet.favorited}",
                  created_at: "${tweet.date}",
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
          'X-Hasura-Admin-Secret': process.env.EREBOR_KEY,
        },
        method: 'POST',
        url: process.env.EREBOR_ENDPOINT,
      })
        .then(result => {
          if (result.data.errors) {
            console.error('Erebor Query:', result.data.errors[0].message);
            process.exitCode = 1;
          } else {
            // eslint-disable-next-line no-console
            console.info(
              'Saved new Tweets to Erebor.',
              result.data.data.insert_tweets
            );
          }
        })
        .catch(err => {
          console.error('Erebor Request:', err);
          process.exitCode = 1;
        });
    }
  } else {
    console.info('No new tweets to upload'); // eslint-disable-line
  }
});
