import type { LatestTweetFmt } from "./types.ts";

/**
 * Upload tweet object to Airtable
 * @function
 *
 * @param {LatestTweetFmt} tweet
 * @return {Promise<voide>}
 */
const uploader = async (tweet: LatestTweetFmt): Promise<void> => {
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

export default uploader;
