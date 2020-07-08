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
          records: [
            {
              fields: {
                tweet: tweet.tweet,
                date: tweet.date,
                url: tweet.url,
              },
            },
          ],
        },
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        url: `${process.env.AIRTABLE_MEDIA_ENDPOINT}/Tweets`,
      })
        .then(result => {
          if (result.error) {
            console.error(`${result.error.type}:`, result.error.message);
            process.exitCode = 1;
          } else {
            // eslint-disable-next-line no-console
            console.info(
              'Saved new Tweets to Airtable.',
              result.data.records[0].fields
            );
          }
        })
        .catch(err => {
          console.error('Airtable Request:', err);
          process.exitCode = 1;
        });
    }
  } else {
    console.info('No new tweets to upload'); // eslint-disable-line
  }
});
