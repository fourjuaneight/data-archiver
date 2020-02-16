const axios = require('axios');
const { clean } = require('./unicode');
const { dateFmt } = require('./dateFmt');

const auth = async (key, secret) => {
  const data = `${key}:${secret}`;
  const buffData = Buffer.from(data);
  const encodedData = buffData.toString('base64');
  const authOpts = {
    data: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${encodedData}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    method: 'POST',
    url: 'https://api.twitter.com/oauth2/token',
    withCredentials: true,
  };

  const token = await axios(authOpts)
    .then(result => result.data.access_token)
    .catch(err => {
      // eslint-disable-next-line no-console
      console.error('Token:', err);
    });

  return token;
};
const ereborTweet = async (endpoint, id, password) => {
  const lastUploaded = await axios({
    data: {
      query: `
          query LastTweet {
            tweets_by_pk(id: "${id}") {
              id
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
    .then(result => result.data.data.tweets_by_pk) // eslint-disable-line
    .catch(err => {
      // eslint-disable-next-line no-console
      console.error('Erebor:', err);
    });

  return lastUploaded;
};
const lastTweet = async key => {
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
          const { compare, original } = dateFmt(twt.date);

          return original > compare;
        });
      /* eslint-enable */

      return cleanTweet;
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.error('Tweet:', err);
    });

  return tweet;
};

exports.auth = auth;
exports.ereborTweet = ereborTweet;
exports.lastTweet = lastTweet;
