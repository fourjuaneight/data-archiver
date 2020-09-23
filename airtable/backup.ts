import "https://deno.land/x/dotenv/load.ts";
import { ensureFile } from "https://deno.land/std/fs/mod.ts";
import ky from "https://unpkg.com/ky/index.js";

import { IBases, IEndpoints, IFields, IKyOptions, IRecords, StringArray } from "./types.ts";

// Match table queries
const baseQueries: IBases = {
  Bookmarks: ["Articles", "Comics", "Podcasts", "Reddits", "Tweets", "Videos"],
  Media: ["Apps", "Books", "Games", "Movies", "Podcasts", "RSS", "Shows"],
};

// Base endpoints
const endpoints: IEndpoints = {
  Bookmarks: Deno.env.get("AIRTABLE_BOOKMARKS_ENDPOINT"),
  Media: Deno.env.get("AIRTABLE_MEDIA_ENDPOINT"),
};

/**
 * Get bookmarks list from Airtable
 * @function
 *
 * @param {string} base Airtable database
 * @param {StringArray} list database list
 * @return {Promise<IRecords[]>}
 */
const getBookmarks = async (base: string, list: StringArray): Promise<IRecords[]> => {
  const atOpts: IKyOptions = {
    headers: {
      Authorization: `Bearer ${Deno.env.get("AIRTABLE_API")}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const reponse: any = await ky
      .get(`${endpoints[base]}/${list}?maxRecords=1000`, atOpts)
      .json();

    return reponse.records;
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
 * @param {StringArray} list database list
 * @return {Promise<void>}
 */
const saveBookmarks = async (
  records: IRecords[],
  list: StringArray
): Promise<void> => {
  const fields: IFields[] = records.map((record: IRecords) => record.fields);
  const record: string = list.toLowerCase();

  try {
    // create file if doesn't exsit
    await ensureFile(`./records/${record}.json`);
    // write record to file
    await Deno.writeTextFile(`./records/${record}.json`, JSON.stringify(fields, undefined, 2));
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
 * @param {StringArray} list database list
 * @return {Promise<void>}
 */
const backup = async (base: string, list: StringArray): Promise<void> => {
  try {
    const records: IRecords[] = await getBookmarks(base, list);

    await saveBookmarks(records, list);
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

// Get all items from table and save them locally
for (const base in baseQueries) {
  for (const list of baseQueries[base]) {
    backup(base, list);
  }
}
