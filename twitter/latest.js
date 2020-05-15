const process = require('process');
const axios = require('axios');
const { clean } = require('../util/unicode');
const { dateFmt } = require('../util/dateFmt');

// Async find and replace from string
const asyncReplace = async (str, regex, fn) => {
  const promises = [];
  str.replace(regex, (match, ...args) => {
    const promise = fn(match, ...args);
    promises.push(promise);
  });
  const data = await Promise.all(promises);

  return str.replace(regex, () => data.shift());
};

// Expand shortend URLs
const expandLinks = async url => {
  const link = await axios
    .get(url)
    .then(response => response.request.res.responseUrl)
    .catch(error => console.error(error));

  return link;
};

// Get time 10 minutes ago
const tenBehind = () => {
  const now = new Date();
  const tenMinutesAgo = now.setMinutes(now.getMinutes() - 10);
  const offset = now.getTimezoneOffset() * 60000;
  const dateTime = new Date(tenMinutesAgo - offset).toISOString().slice(0, -5);

  return dateTime;
};

// Get latest tweet
const latest = async key => {
  const twtOpts = {
    headers: {
      Authorization: `Bearer ${key}`,
    },
    method: 'GET',
    url:
      'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=fourjuaneight&count=10&tweet_mode=extended',
    withCredentials: true,
  };

  const RTd = tweet => tweet.match(/^RT\s/g) !== null;
  const rtCount = (count, text) => (RTd(text) ? 0 : count);

  const tweet = await axios(twtOpts)
    .then(result => {
      /* eslint-disable sort-keys */
      const cleanTweet = result.data
        .map(twt => ({
          id: twt.id_str,
          date: dateFmt(twt.created_at).original,
          tweet: clean(twt.full_text),
          retweet: RTd(twt.full_text),
          retweeted: rtCount(twt.retweet_count, twt.full_text),
          favorited: twt.favorite_count,
        }))
        .filter(twt => {
          const { original } = dateFmt(twt.date);

          return original > tenBehind();
        });
      /* eslint-enable */

      return cleanTweet;
    })
    .then(tweets => {
      const expanded = tweets.map(async twt => ({
        ...twt,
        tweet: await asyncReplace(
          twt.tweet,
          /(https:\/\/t.co\/[a-zA-z0-9]+)/g,
          expandLinks
        ).then(result => result),
      }));
      return Promise.all(expanded).then(result => result);
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.error('Get Tweets:', err);
      process.exitCode = 1;
    });

  return tweet;
};

exports.latest = latest;
