import auth from "./auth.ts";
import dateFmt, { tenBehind } from "../util/dateFmt.ts";
import emojiUnicode from "../util/emojiUnicode.ts";
import expandShortLink from "../util/expandShortLink.ts";

import type { ILatestTweet, ILatestTweetFmt } from "./types.ts";

/**
 * Get the latest Tweets as of the last 10 minutes
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
      "https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=fourjuaneight&count=15&tweet_mode=extended",
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

    return results;
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
  const converted: ILatestTweetFmt[] = rawTweets.map((twt: ILatestTweet) => ({
    tweet: emojiUnicode(twt.full_text),
    date: dateFmt(twt.created_at).original,
    url: `https://twitter.com/fourjuaneight/status/${twt.id_str}`,
  }));
  const expanded: Promise<ILatestTweetFmt>[] = converted
    .filter((twt: ILatestTweetFmt) => {
      const { original } = dateFmt(twt.date);

      if (original) {
        return original > tenBehind();
      }
    })
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
