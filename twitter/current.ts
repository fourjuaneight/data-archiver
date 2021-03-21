import "https://deno.land/x/dotenv/load.ts";
import { format } from "https://deno.land/std/datetime/mod.ts";
import {
  isAfter,
  subDays,
} from "https://cdn.skypack.dev/date-fns?dts";

import auth from "./auth.ts";
import emojiUnicode from "../util/emojiUnicode.ts";
import expandShortLink from "../util/expandShortLink.ts";

import type { LatestTweet, LatestTweetFmt } from "./types.ts";

/**
 * Get the extended Tweets by ID.
 * Docs: https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/get-statuses-show-id
 * @function
 *
 * @param {string} key Twitter authorization token
 * @param {string} [id] Tweet ID
 * @return {Promise<LatestTweet>} request response with tweet details
 */
const currentTweet = async (
  key: string,
  id?: string
): Promise<LatestTweet> => {
  const twtOpts: RequestInit = {
    headers: {
      Authorization: `Bearer ${key}`,
    },
  };

  if (id) {
    try {
      const response: Response = await fetch(
        `https://api.twitter.com/1.1/statuses/show.json?id=${id}&tweet_mode=extended`,
        twtOpts
      );
      const results: LatestTweet = await response.json();

      if (!response.ok) {
        console.error("Current Tweet:", {
          code: response.status,
          type: response.type,
          text: response.statusText,
        });
        Deno.exit(1);
      }

      return results;
    } catch (error) {
      console.error("Current Tweet:", error);
      Deno.exit(1);
    }
  } else {
    console.error("Missing tweet ID.");
    Deno.exit(1);
  }
};

/**
 * Extract relevate parts of Twitter response and create formatted object
 * @function
 *
 * @param {LatestTweet} rawTweet raw tweet object from Twitter API response
 * @return {Promise<LatestTweetFmt>} formatted tweet object; tweet (emojis converted && links expanded), ISO date, url.
 */
const formatTweet = async (
  rawTweet: LatestTweet
): Promise<LatestTweetFmt> => {
  const encoded: string = emojiUnicode(rawTweet.full_text);
  const expanded: string = await expandShortLink(
    encoded,
    /(https:\/\/t.co\/[a-zA-z0-9]+)/g
  ).then((result: string) => result);
  const formatted: LatestTweetFmt = {
    tweet: expanded,
    date: format(new Date(twt.created_at), "yyyy-MM-dd'T'HH:mm:ss"),
    url: `https://twitter.com/fourjuaneight/status/${rawTweet.id_str}`,
  };

  return formatted;
};

/**
 * Get current tweet from Twitter API, formatted.
 * @function
 *
 * @return {Promise<LatestTweetFmt>} { tweet, date, url }
 */
const current = async (): Promise<LatestTweetFmt> => {
  try {
    const key: string = await auth();
    const last: LatestTweet = await currentTweet(
      key,
      Deno.env.get("TWEET_ID")
    );
    const lastFmt: LatestTweetFmt = await formatTweet(last);

    return lastFmt;
  } catch (error) {
    console.error("Twitter Latest Formatted:", error);
    Deno.exit(1);
  }
};

export default current;
