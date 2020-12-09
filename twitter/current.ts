import "https://deno.land/x/dotenv/load.ts";

import auth from "./auth.ts";
import dateFmt from "../util/dateFmt.ts";
import emojiUnicode from "../util/emojiUnicode.ts";
import expandShortLink from "../util/expandShortLink.ts";

import type { ILatestTweet, ILatestTweetFmt } from "./types.ts";

/**
 * Get the extended Tweets by ID.
 * Docs: https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/get-statuses-show-id
 * @function
 *
 * @param {string} key Twitter authorization token
 * @param {string} [id] Tweet ID
 * @return {Promise<ILatestTweet>} request response with tweet details
 */
const currentTweet = async (
  key: string,
  id?: string
): Promise<ILatestTweet> => {
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
      const results: ILatestTweet = await response.json();

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
 * @param {ILatestTweet} rawTweet raw tweet object from Twitter API response
 * @return {Promise<ILatestTweetFmt>} formatted tweet object; tweet (emojis converted && links expanded), ISO date, url.
 */
const emojiUnicodeTweets = async (
  rawTweet: ILatestTweet
): Promise<ILatestTweetFmt> => {
  const encoded: string = emojiUnicode(rawTweet.full_text);
  const expanded: string = await expandShortLink(
    encoded,
    /(https:\/\/t.co\/[a-zA-z0-9]+)/g
  ).then((result: string) => result);
  const formatted: ILatestTweetFmt = {
    tweet: expanded,
    date: dateFmt(rawTweet.created_at).original,
    url: `https://twitter.com/fourjuaneight/status/${rawTweet.id_str}`,
  };

  return formatted;
};

/**
 * Get current tweet from Twitter API, formatted.
 * @function
 *
 * @return {Promise<ILatestTweetFmt>} { tweet, date, url }
 */
const current = async (): Promise<ILatestTweetFmt> => {
  try {
    const key: string = await auth();
    const last: ILatestTweet = await currentTweet(
      key,
      Deno.env.get("TWEET_ID")
    );
    const lastFmt: ILatestTweetFmt = await emojiUnicodeTweets(last);

    return lastFmt;
  } catch (error) {
    console.error("Twitter Latest Formatted:", error);
    Deno.exit(1);
  }
};

export default current;
