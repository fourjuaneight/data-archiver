const { resolve } = require('path');
const axios = require('axios');
const dotenv = require('dotenv').config({
  path: resolve(process.cwd(), '.env'),
});
const { clean } = require('./util/unicode');

const argv = process.argv.slice(2);
const data = `${dotenv.parsed.TWITTER_KEY}:${dotenv.parsed.TWITTER_SECRET}`;
const buffData = Buffer.from(data);
const encodedData = buffData.toString('base64');

const dateFmt = date => new Date(date).toISOString();
const RTd = tweet => tweet.match(/^RT\s/g) !== null;
const rtCount = (count, text) => (RTd(text) ? 0 : count);
const getToken = async keys => {
  const authOpts = {
    data: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${keys}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    method: 'POST',
    url: dotenv.parsed.TWITTER_AUTH_URL,
    withCredentials: true,
  };

  const token = await axios(authOpts)
    .then(result => result.data.access_token)
    .catch(err => console.error('Token:', err.response.status)); // eslint-disable-line

  return token;
};
const uploadTweet = tweet =>
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
    .catch(err => console.error('Erebor:', err.response.status)); // eslint-disable-line

getToken(encodedData)
  .then(token => {
    const twtOpts = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: 'GET',
      url: `https://api.twitter.com/1.1/statuses/show/${argv[0]}.json?tweet_mode=extended`,
      withCredentials: true,
    };

    axios(twtOpts)
      .then(result => {
        /* eslint-disable sort-keys */
        const cleanTweet = {
          id: result.data.id_str,
          date: dateFmt(result.data.created_at),
          tweet: clean(result.data.full_text),
          retweet: RTd(result.data.full_text),
          retweeted: rtCount(result.data.retweet_count, result.data.full_text),
          favorited: result.data.favorite_count,
        };
        /* eslint-enable */

        uploadTweet(cleanTweet);
      })
      .catch(err => console.error('Tweet:', err.response.status)); // eslint-disable-line
  })
  .catch(err => console.error(err.response.status)); // eslint-disable-line
