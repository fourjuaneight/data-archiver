import auth from "./auth.ts";
import dateFmt from "../util/dateFmt.ts";
import emojiUnicode from "../util/emojiUnicode.ts";
import expandShortLink from "../util/expandShortLink.ts";

import type { ILatestTweet, ILatestTweetFmt } from "./types.ts";

/**
 * Get timestamp from 1 day ago.
 *
 * @return {string} datetime - 10m
 */
const dayAgo = (): string => {
  const now: Date = new Date();
  const tenMinutesAgo: number = now.setDate(now.getDate() - 1);
  const offset: number = now.getTimezoneOffset() * 60000;
  const dateTime: string = new Date(tenMinutesAgo - offset)
    .toISOString()
    .slice(0, -5);

  return dateTime;
};

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
      Authorization: `Bearer ${key}`,
    },
  };

  try {
    const response: Response = await fetch(
      "https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=fourjuaneight&count=50&tweet_mode=extended",
      twtOpts
    );
    const results: ILatestTweet[] = await response.json();

    if (!response.ok) {
      console.error("Twitter Latest:", {
        code: response.status,
        type: response.type,
        text: response.statusText,
      });
      Deno.exit(1);
    }

    return results.filter((twt: ILatestTweet) => {
      const { original } = dateFmt(twt.created_at);

      if (original) {
        return original > dayAgo();
      }
    });
  } catch (error) {
    console.error("Twitter Latest:", error);
    Deno.exit(1);
  }
};

/**
 * Extract relevate parts of Twitter response and create formatted object
 * @function
 *
 * @param {ILatestTweet[]} rawTweets raw tweet object array from Twitter API response
 * @return {Promise<ILatestTweetFmt[]>} formatted tweet object array; tweet (emojis converted && links expanded), ISO date, url.
 */
const emojiUnicodeTweets = (
  rawTweets: ILatestTweet[]
): Promise<ILatestTweetFmt[]> => {
  const expanded: Promise<ILatestTweetFmt>[] = rawTweets
    .map((twt: ILatestTweet) => ({
      tweet: emojiUnicode(twt.full_text),
      date: dateFmt(twt.created_at).original,
      url: `https://twitter.com/fourjuaneight/status/${twt.id_str}`,
    }))
    .map(async (twt: ILatestTweetFmt) => ({
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
    const lastFmt: ILatestTweetFmt[] = await emojiUnicodeTweets(last);

    return lastFmt;
  } catch (error) {
    console.error("Twitter Latest Formatted:", error);
    Deno.exit(1);
  }
};

export default latest;
