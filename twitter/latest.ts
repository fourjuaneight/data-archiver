import { format } from "https://deno.land/std/datetime/mod.ts";
import { isAfter, subDays } from "https://cdn.skypack.dev/date-fns?dts";

import auth from "./auth.ts";
import emojiUnicode from "../util/emojiUnicode.ts";
import expandShortLink from "../util/expandShortLink.ts";

import type { LatestTweet, LatestTweetFmt } from "./types.ts";

/**
 * Get the last 50 Tweets with extended content.
 * Docs: https://developer.twitter.com/en/docs/twitter-api/v1/tweets/timelines/api-reference/get-statuses-user_timeline
 * @function
 *
 * @param {string} key Twitter authorization token
 * @return {Promise<LatestTweet[]>} request response with list of tweets
 */
const latestTweets = async (key: string): Promise<LatestTweet[]> => {
  const twtOpts: RequestInit = {
    headers: {
      Authorization: `Bearer ${await key}`,
    },
  };

  try {
    const response: Response = await fetch(
      "https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=fourjuaneight&count=50&tweet_mode=extended",
      twtOpts
    );
    const results: LatestTweet[] = await response.json();
    const dayAgo: Date = subDays(new Date(), 1);

    if (!response.ok) {
      console.error("Twitter Latest:", {
        code: response.status,
        type: response.type,
        text: response.statusText,
      });
      Deno.exit(1);
    }

    return results.filter((twt: LatestTweet) =>
      isAfter(new Date(twt.created_at), dayAgo)
    );
  } catch (error) {
    console.error("Twitter Latest:", error);
    Deno.exit(1);
  }
};

/**
 * Extract relevate parts of Twitter response and create formatted object.
 * @function
 *
 * @param {LatestTweet[]} rawTweets raw tweet object array from Twitter API response
 * @return {LatestTweetFmt[]} formatted tweet object array; tweet (emojis converted), ISO date, url
 */
const formatTweets = (rawTweets: LatestTweet[]): LatestTweetFmt[] => {
  const formatted: LatestTweetFmt[] = rawTweets.map((twt: LatestTweet) => ({
    tweet: emojiUnicode(twt.full_text),
    date: format(new Date(twt.created_at), "yyyy-MM-dd'T'HH:mm:ss"),
    url: `https://twitter.com/fourjuaneight/status/${twt.id_str}`,
  }));

  return formatted;
};

/**
 * Expand shortened links in tweet body.
 * @function
 *
 * @param {LatestTweetFmt[]} fmtTweets formatted tweet object array
 * @return {Promise<LatestTweetFmt[]>} formatted tweet object array; links expanded
 */
const expandTweets = (
  fmtTweets: LatestTweetFmt[]
): Promise<LatestTweetFmt[]> => {
  const expanded = fmtTweets.map(async (twt: LatestTweetFmt) => ({
    ...twt,
    tweet: await expandShortLink(
      twt.tweet,
      /(https:\/\/t.co\/[a-zA-z0-9]+)/g
    ).then((result: string) => result),
  }));

  return Promise.all(expanded);
};

/**
 * Get latest tweets from Twitter API, formatted.
 * @function
 *
 * @return {Promise<LatestTweetFmt[]>} { tweet, date, url }
 */
const latest = async (): Promise<LatestTweetFmt[]> => {
  try {
    const key: string = await auth();
    const last: LatestTweet[] = await latestTweets(key);
    const lastFmt: LatestTweetFmt[] = await formatTweets(last);
    const lastExp: LatestTweetFmt[] = await expandTweets(lastFmt);

    return lastExp;
  } catch (error) {
    console.error("Twitter Latest Formatted:", error);
    Deno.exit(1);
  }
};

export default latest;
