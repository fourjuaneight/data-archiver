const { resolve } = require('path');
const axios = require('axios');
const dotenv = require('dotenv').config({
  path: resolve(process.cwd(), '.env'),
});
const { clean } = require('./unicode');
const authTwitter = require('./authTwitter');

const dateFmt = date => new Date(date).toISOString();
const RTd = tweet => tweet.match(/^RT\s/g) !== null;
const rtCount = (count, text) => (RTd(text) ? 0 : count);
const getTweet = async key => {
  const options = {
    headers: {
      Authorization: `Bearer ${key}`,
    },
    method: 'GET',
    url: dotenv.parsed.TWITTER_TWEETS_URL,
    withCredentials: true,
  };

  const tweet = await axios(options)
    .then(result => {
      /* eslint-disable sort-keys */
      const cleanTweet = result.data.map(twt => ({
        id: twt.id,
        date: dateFmt(twt.created_at),
        tweet: clean(twt.full_text),
        retweet: RTd(twt.full_text),
        retweeted: rtCount(twt.retweet_count, twt.full_text),
        favorited: twt.favorite_count,
      }));
      /* eslint-enable */

      return cleanTweet;
    })
    .catch(err => console.error('Tweet:', err.response.status)); // eslint-disable-line

  return tweet;
};

module.exports = authTwitter
  .then(token => getTweet(token))
  .catch(err => console.error(err)); // eslint-disable-line
