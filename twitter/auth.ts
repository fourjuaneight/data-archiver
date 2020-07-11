import ky from 'https://unpkg.com/ky/index.js';
import { Base64 } from 'https://deno.land/x/bb64/mod.ts';

/**
 * Get authorization token from Twitter.
 * Uses ky as a Fetch wrapper.
 * @function
 *
 * @param   {string} key    Twitter authorization key
 * @param   {string} secret Twitter authorization secret
 * @returns {Promise<Response>} fetch response body
 */
const auth = async (key: string, secret: string): Promise<Response> => {
  const encoder = new TextEncoder();

  const data: string = `${key}:${secret}`;
  const buffData = encoder.encode(data);
  const encodedData = Base64.fromUint8Array(buffData).toString();

  const authOpts: Object = {
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${encodedData}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    withCredentials: true,
  };

  const token: Promise<Response> = await ky
    .post('https://api.twitter.com/oauth2/token', authOpts)
    .then((response: Response) => response.json())
    .catch((err: string) => console.error('Token:', err));

  return token;
};

export default auth;
