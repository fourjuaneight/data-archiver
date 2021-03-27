import latest from "./latest.ts";
import uploader from "./uploader.ts";

import type { LatestTweetFmt } from "./types.ts";

// Upload latest tweets to Airtable base.
(async () => {
  try {
    // get formatted tweets
    const tweets: LatestTweetFmt[] | null = await latest();

    // upload each individually
    if (tweets && tweets.length > 0) {
      for (const tweet of tweets) {
        try {
          const upload = await uploader(tweet);

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
