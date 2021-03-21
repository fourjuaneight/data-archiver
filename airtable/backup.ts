import "https://deno.land/x/dotenv/load.ts";
import { ensureFile } from "https://deno.land/std/fs/mod.ts";

import type {
  IAirtableResp,
  IBases,
  IEndpoints,
  IFields,
  IList,
  IRecords,
  StringArray,
} from "./types.ts";

// Match table queries
const baseQueries: IBases = {
  Bookmarks: {
    Articles: [],
    Comics: [],
    Podcasts: [],
    Tweets: [],
    Videos: [],
  },
  Media: {
    Books: [],
    Games: [],
    Movies: [],
    Podcasts: [],
    RSS: [],
    Shows: [],
  },
};
const bookmarksList = Object.keys(baseQueries.Bookmarks);
const mediaList = Object.keys(baseQueries.Media);

// Base endpoints
const endpoints: IEndpoints = {
  Bookmarks: Deno.env.get("AIRTABLE_BOOKMARKS_ENDPOINT"),
  Media: Deno.env.get("AIRTABLE_MEDIA_ENDPOINT"),
};

/**
 * Get bookmarks list from Airtable.
 * Request can be recursive is there is more than 100 records.
 * @function
 *
 * @param {string} base Airtable database
 * @param {string} list database list
 * @param {[string]} offset param to request remainding records
 * @return {Promise<IAirtableResp>}
 */
const getBookmarksWithOffset = async (
  base: string,
  list: string,
  offset?: string
): Promise<IAirtableResp> => {
  const atOpts: RequestInit = {
    headers: {
      Authorization: `Bearer ${Deno.env.get("AIRTABLE_API")}`,
      "Content-Type": "application/json",
    },
  };
  const url = offset
    ? `${endpoints[base]}/${list}?offset=${offset}`
    : `${endpoints[base]}/${list}`;

  try {
    return fetch(url, atOpts)
      .then((response: Response) => response.json())
      .then(async (airtableRes: IAirtableResp) => {
        baseQueries[base][list] = [
          ...baseQueries[base][list],
          ...airtableRes.records,
        ];

        if (airtableRes.offset) {
          return getBookmarksWithOffset(base, list, airtableRes.offset);
        } else {
          return airtableRes;
        }
      });
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

/**
 * Saves Airtable record response to a local JSON file.
 * @function
 *
 * @param {IRecords[]} records record object
 * @param {string} base Airtable database
 * @param {string} list database list
 * @return {Promise<void>}
 */
const saveBookmarks = async (
  records: IRecords[],
  base: string,
  list: string
): Promise<void> => {
  const fields: IFields[] = records.map((record: IRecords) => record.fields);
  const category: string = base.toLowerCase();
  const record: string = list.toLowerCase();

  try {
    // create file if doesn't exsit
    await ensureFile(`./records/${category}/${record}.json`);
    // write record to file
    await Deno.writeTextFile(
      `./records/${category}/${record}.json`,
      JSON.stringify(fields, undefined, 2)
    );
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

/**
 * Save Airtable lists to local JSON files.
 * @function
 *
 * @param {string} base Airtable database
 * @param {string} list database list
 * @return {Promise<void>}
 */
const backup = async (base: string, list: string): Promise<void> => {
  try {
    await getBookmarksWithOffset(base, list);
    await saveBookmarks(baseQueries[base][list], base, list);
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

// Get all items from table and save them locally
for (const list of bookmarksList) {
  backup("Bookmarks", list);
}

for (const list of mediaList) {
  backup("Media", list);
}
