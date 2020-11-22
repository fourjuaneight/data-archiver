import latest from "./latest.ts";

import type { ILatestTweetFmt } from "./types.ts";

/**
 * Upload tweet object to Airtable
 * @function
 *
 * @param {ILatestTweetFmt} tweet
 * @return {Promise<voide>}
 */
const uploadTweet = async (tweet: ILatestTweetFmt): Promise<void> => {
  const atOpts: RequestInit = {
    headers: {
      Authorization: `Bearer ${Deno.env.get("AIRTABLE_API")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      records: [
        {
          fields: {
            tweet: tweet.tweet,
            date: tweet.date,
            url: tweet.url,
          },
        },
      ],
    }),
  };

  try {
    const response: Response = await fetch(
      `${Deno.env.get("AIRTABLE_MEDIA_ENDPOINT")}/Tweets`,
      atOpts
    );
    const results = await response.json();

    if (!response.ok) {
      console.error("Twitter Uploader:", {
        code: response.status,
        type: response.type,
        text: response.statusText,
      });
      Deno.exit(1);
    }

    return results.records[0].id;
  } catch (error) {
    console.error("Twitter Uploader:", error);
    Deno.exit(1);
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
          console.error("Twitter Upload Loop:", error);
          Deno.exit(1);
        }
      }
    } else {
      console.info("No new tweets to upload.");
    }
  } catch (error) {
    console.error("Twitter Upload Main:", error);
    Deno.exit(1);
  }
})();
