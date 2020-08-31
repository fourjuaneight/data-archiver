import ky from "https://unpkg.com/ky/index.js";

import latest from "./latest.ts";
import { IKyOptions, ILatestTweetFmt } from "../types.d.ts";

/**
 * Upload tweet object to Airtable
 * @function
 *
 * @param {ILatestTweetFmt} tweet
 * @return {Promise<voide>}
 */
const uploadTweet = async (tweet: ILatestTweetFmt): Promise<void> => {
  const atOpts: IKyOptions = {
    headers: {
      Authorization: `Bearer ${Deno.env.get("AIRTABLE_API")}`,
      "Content-Type": "application/json",
    },
    json: {
      records: [
        {
          fields: {
            tweet: tweet.tweet,
            date: tweet.date,
            url: tweet.url,
          },
        },
      ],
    },
  };

  try {
    const reponse: any = await ky
      .post(`${Deno.env.get("AIRTABLE_MEDIA_ENDPOINT")}/Tweets`, atOpts)
      .json();

    return reponse.records[0].id;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

// Upload latest tweets to Airtable base.
(async () => {
  try {
    // get formatted tweets
    const tweets: ILatestTweetFmt[] = await latest();

    // upload each individually
    if (tweets.length > 0) {
      for (const tweet of tweets) {
        try {
          const upload = await uploadTweet(tweet);

          // post Airtable ID to console when uploaded
          console.log("Tweet uploaded:", upload);
        } catch (error) {
          console.error(error);
          throw new Error(error);
        }
      }
    } else {
      console.info("No new tweets to upload.");
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
})();
