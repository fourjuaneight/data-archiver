const { resolve } = require('path');
const axios = require('axios');
const dotenv = require('dotenv').config({
  path: resolve(process.cwd(), '.env'),
});

const data = `${dotenv.parsed.TWITTER_KEY}:${dotenv.parsed.TWITTER_SECRET}`;
const buffData = Buffer.from(data);
const encodedData = buffData.toString('base64');
const options = {
  data: 'grant_type=client_credentials',
  headers: {
    Authorization: `Basic ${encodedData}`,
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
  },
  method: 'POST',
  url: dotenv.parsed.TWITTER_AUTH_URL,
  withCredentials: true,
};

module.exports = axios(options)
  .then(result => result.data.access_token)
  .catch(err => console.error('Token:', err.response.status)); // eslint-disable-line
