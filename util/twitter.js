const axios = require('axios');
const { clean } = require('./unicode');

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
      throw new Error('Token:', err.response.status);
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
      throw new Error('Erebor:', err.response.status);
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
      'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=fourjuaneight&count=1&tweet_mode=extended',
    withCredentials: true,
  };

  // const dateFmt = date => new Date(`${date} GMT-05:00`).toISOString();
  const dateFmt = date => {
    const original = new Date(date);
    const offset = original.getTimezoneOffset() * 60000;

    return new Date(original - offset).toISOString();
  };
  const RTd = tweet => tweet.match(/^RT\s/g) !== null;
  const rtCount = (count, text) => (RTd(text) ? 0 : count);

  const tweet = await axios(twtOpts)
    .then(result => {
      /* eslint-disable sort-keys */
      const cleanTweet = result.data.map(twt => ({
        id: twt.id_str,
        date: dateFmt(twt.created_at),
        tweet: clean(twt.full_text),
        retweet: RTd(twt.full_text),
        retweeted: rtCount(twt.retweet_count, twt.full_text),
        favorited: twt.favorite_count,
      }));
      /* eslint-enable */

      return cleanTweet;
    })
    .catch(err => {
      throw new Error('Tweet:', err.response.status);
    });

  return tweet;
};

exports.auth = auth;
exports.ereborTweet = ereborTweet;
exports.lastTweet = lastTweet;
