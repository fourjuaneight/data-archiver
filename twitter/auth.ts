import "https://deno.land/x/dotenv/load.ts";
import { Base64 } from "https://deno.land/x/bb64/mod.ts";

import type { IAuthToken } from "./types.ts";

/**
 * Get authorization token from Twitter.
 * @function
 *
 * @returns {Promise<string>} fetch response body
 */
const auth = async (): Promise<string> => {
  const encoder = new TextEncoder();

  const data: string = `${Deno.env.get("TWITTER_KEY")}:${Deno.env.get(
    "TWITTER_SECRET"
  )}`;
  const buffData: Uint8Array = encoder.encode(data);
  const encodedData: string = Base64.fromUint8Array(buffData).toString();

  const authOpts: RequestInit = {
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${encodedData}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    method: "POST",
  };

  try {
    const response: Response = await fetch(
      "https://api.twitter.com/oauth2/token",
      authOpts
    );
    const results: IAuthToken = await response.json();

    if (!response.ok) {
      console.error("Twitter Auth:", {
        code: response.status,
        type: response.type,
        text: response.statusText,
      });
      Deno.exit(1);
    }

    return results.access_token;
  } catch (error) {
    console.error("Twitter Auth:", error);
    Deno.exit(1);
  }
};

export default auth;
