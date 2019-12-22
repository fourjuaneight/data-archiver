#!/usr/bin/env node

const { resolve } = require('path');
const { writeFileSync } = require('fs');
const axios = require('axios');
const dotenv = require('dotenv').config({
  path: resolve(process.cwd(), '.env'),
});
const regex = require('./util/unicodeRange');

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
    // eslint-disable-next-line no-console
    .then(result => result.data.access_token)
    .catch(err => console.error(err.response.status, err.response.statusText));

  return token;
};
const emojiUnicode = emoji => {
  let comp;

  if (emoji.length === 1) {
    comp = emoji.charCodeAt(0);
  }

  comp =
    (emoji.charCodeAt(0) - 0xd800) * 0x400 +
    (emoji.charCodeAt(1) - 0xdc00) +
    0x10000;

  if (comp < 0) {
    comp = emoji.charCodeAt(0);
  }

  comp = `U+${comp.toString('16')}`;

  return comp;
};
const clean = tweet => tweet.replace(regex, p1 => `${emojiUnicode(p1)}`);

getToken(encodedData)
  .then(token => {
    const twtOpts = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: 'GET',
      url: dotenv.parsed.TWITTER_TWEETS_URL,
      withCredentials: true,
    };

    axios(twtOpts)
      .then(result => {
        /* eslint-disable sort-keys */
        const cleanTwts = result.data.map(twt => ({
          id: twt.id,
          date: dateFmt(twt.created_at),
          tweet: clean(twt.text),
          retweeted: RTd(twt.text),
          retweets: rtCount(twt.retweet_count, twt.text),
          favorite: twt.favorite_count,
        }));
        /* eslint-enable */

        writeFileSync(
          resolve(__dirname, 'records', 'tweets.json'),
          JSON.stringify(cleanTwts, undefined, 2),
          'utf8'
        );
      })
      .catch(err =>
        console.error(err.response.status, err.response.statusText)
      );
  })
  .catch(err => console.error(err));
