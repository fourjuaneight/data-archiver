require('dotenv').config();
const axios = require('axios');
const { auth, lastTweet } = require('./util/twitter');

const getLastTweet = auth(process.env.TWITTER_KEY, process.env.TWITTER_SECRET)
  .then(token =>
    lastTweet(token)
      .then(tweet => tweet)
      .catch(err =>
        axios.post(process.env.PUSHCUT_ENDPOINT, {
          title: 'Error getting last Tweet',
          text: err,
        })
      )
  )
  .catch(err =>
    axios.post(process.env.PUSHCUT_ENDPOINT, {
      title: 'Error getting Twitter Bearer Token',
      text: err,
    })
  );

getLastTweet.then(tweets => {
  if (tweets.length > 0) {
    // eslint-disable-next-line no-restricted-syntax
    for (const tweet of tweets) {
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
          'X-Hasura-Admin-Secret': process.env.EREBOR_KEY,
        },
        method: 'POST',
        url: process.env.EREBOR_ENDPOINT,
      })
        .then(result =>
          axios.post(process.env.PUSHCUT_ENDPOINT, {
            title: 'Save new Tweet to Erebor',
            text: result.data.data.insert_tweets.returning,
          })
        )
        .catch(err =>
          axios.post(process.env.PUSHCUT_ENDPOINT, {
            title: 'Error uploading to Erebor',
            text: err,
          })
        );
    }
  } else {
    console.info('No new tweets to upload'); // eslint-disable-line
  }
});
