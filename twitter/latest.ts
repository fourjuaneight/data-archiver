import {
  formatISO,
  isAfter,
  subDays,
} from "https://cdn.skypack.dev/date-fns?dts";

import auth from "./auth.ts";
import emojiUnicode from "../util/emojiUnicode.ts";
import expandShortLink from "../util/expandShortLink.ts";

import type { ILatestTweet, ILatestTweetFmt } from "./types.ts";

/**
 * Get the last 50 Tweets with extended content.
 * Docs: https://developer.twitter.com/en/docs/twitter-api/v1/tweets/timelines/api-reference/get-statuses-user_timeline
 * @function
 *
 * @param {string} key Twitter authorization token
 * @return {Promise<ILatestTweet[]>} request response with list of tweets
 */
const latestTweets = async (key: string): Promise<ILatestTweet[]> => {
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
    const results: ILatestTweet[] = await response.json();
    const dayAgo: Date = subDays(new Date(), 1);

    if (!response.ok) {
      console.error("Twitter Latest:", {
        code: response.status,
        type: response.type,
        text: response.statusText,
      });
      Deno.exit(1);
    }

    return results.filter((twt: ILatestTweet) =>
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
 * @param {ILatestTweet[]} rawTweets raw tweet object array from Twitter API response
 * @return {ILatestTweetFmt[]} formatted tweet object array; tweet (emojis converted), ISO date, url
 */
const formatTweets = (rawTweets: ILatestTweet[]): ILatestTweetFmt[] => {
  const formatted: ILatestTweetFmt[] = rawTweets.map((twt: ILatestTweet) => ({
    tweet: emojiUnicode(twt.full_text),
    date: formatISO(new Date(twt.created_at)),
    url: `https://twitter.com/fourjuaneight/status/${twt.id_str}`,
  }));

  return formatted;
};

/**
 * Expand shortened links in tweet body.
 * @function
 *
 * @param {ILatestTweetFmt[]} fmtTweets formatted tweet object array
 * @return {Promise<ILatestTweetFmt[]>} formatted tweet object array; links expanded
 */
const expandTweets = (
  fmtTweets: ILatestTweetFmt[]
): Promise<ILatestTweetFmt[]> => {
  const expanded = fmtTweets.map(async (twt: ILatestTweetFmt) => ({
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
 * @return {Promise<ILatestTweetFmt[]>} { tweet, date, url }
 */
const latest = async (): Promise<ILatestTweetFmt[]> => {
  try {
    const key: string = await auth();
    const last: ILatestTweet[] = await latestTweets(key);
    const lastFmt: ILatestTweetFmt[] = await formatTweets(last);
    const lastExp: ILatestTweetFmt[] = await expandTweets(lastFmt);

    return lastExp;
  } catch (error) {
    console.error("Twitter Latest Formatted:", error);
    Deno.exit(1);
  }
};

export default latest;
