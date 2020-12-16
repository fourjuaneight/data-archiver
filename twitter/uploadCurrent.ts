import current from "./current.ts";
import uploader from "./uploader.ts";

import type { ILatestTweetFmt } from "./types.ts";

// Upload current tweet to Airtable base.
(async () => {
  try {
    // get formatted tweets
    const tweet: ILatestTweetFmt = await current();
    const upload = await uploader(tweet);

    // post Airtable ID to console when uploaded
    console.log("Tweet uploaded:", upload);
  } catch (error) {
    console.error("Twitter Upload Current:", error);
    Deno.exit(1);
  }
})();
