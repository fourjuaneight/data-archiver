const axios = require('axios');

// Get authorization token from Twitter
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
    .catch(err => console.error('Token:', err));

  return token;
};

exports.auth = auth;
