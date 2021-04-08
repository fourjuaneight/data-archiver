import "https://deno.land/x/dotenv/load.ts";
import { formatISO, subDays } from "https://cdn.skypack.dev/date-fns?dts";

import emojiUnicode from "../util/emojiUnicode.ts";
import expandShortLink from "../util/expandShortLink.ts";

import type { LatestTweet, LatestTweetFmt, TwitterResponse } from "./types.ts";

let tweets: any[] = [];

/**
 * Get the lastest Tweets from the last 24 hours.
 * Docs: https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-tweets#tab2
 * @function
 *
 * @param {[string]} pagination offset pagination token
 * @return {Promise<LatestTweet[]>} request response with list of tweets
 */
const latestTweets = (pagination?: string): Promise<TwitterResponse> => {
  const dayAgo: Date = subDays(new Date(), 1);
  const twtOpts: RequestInit = {
    headers: {
      Authorization: `Bearer ${Deno.env.get("TWEET_TOKEN")}`,
      "Content-Type": "application/json",
    },
  };
  const params: string = pagination
    ? `max_results=100&tweet.fields=created_at&start_time=${formatISO(
        dayAgo
      )}&pagination_token=${pagination}`
    : `max_results=100&tweet.fields=created_at&start_time=${formatISO(dayAgo)}`;

  try {
    return fetch(
      `https://api.twitter.com/2/users/${Deno.env.get(
        "TWEET_USER_ID"
      )}/tweets?${params}`,
      twtOpts
    )
      .then((response: Response) => response.json())
      .then((twitterResponse: TwitterResponse) => {
        if (twitterResponse.data) {
          tweets = [...tweets, ...twitterResponse.data];
        }

        if (twitterResponse.meta.result_count === 100) {
          return latestTweets(twitterResponse.meta.next_token);
        } else {
          return twitterResponse;
        }
      });
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
    tweet: emojiUnicode(twt.text),
    date: twt.created_at,
    url: `https://twitter.com/fourjuaneight/status/${twt.id}`,
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
const latest = async (): Promise<LatestTweetFmt[] | null> => {
  try {
    await latestTweets();
    if (tweets.length > 0) {
      const lastFmt: LatestTweetFmt[] = await formatTweets(tweets);
      const lastExp: LatestTweetFmt[] = await expandTweets(lastFmt);

      return lastExp;
    }

    return null;
  } catch (error) {
    console.error("Twitter Latest Formatted:", error);
    Deno.exit(1);
  }
};

export default latest;
