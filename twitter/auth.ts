import ky from "https://unpkg.com/ky/index.js";
import { Base64 } from "https://deno.land/x/bb64/mod.ts";
import "https://deno.land/x/dotenv/load.ts";

import { IAuthToken, IKyOptions } from "./types.ts";

/**
 * Get authorization token from Twitter.
 * Uses ky as a Fetch wrapper.
 * @function
 *
 * @returns {Promise<string>} fetch response body
 */
const auth = async (): Promise<string> => {
  const encoder = new TextEncoder();

  const data: string = `${Deno.env.get("TWITTER_KEY")}:${Deno.env.get(
    "TWITTER_SECRET"
  )}`;
  const buffData = encoder.encode(data);
  const encodedData = Base64.fromUint8Array(buffData).toString();

  const authOpts: IKyOptions = {
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${encodedData}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    withCredentials: true,
  };

  try {
    const response: Promise<IAuthToken> = await ky
      .post("https://api.twitter.com/oauth2/token", authOpts)
      .json();

    return (await response).access_token;
  } catch (error) {
    Deno.exit(1);
    return error;
  }
};

export default auth;
