import "https://deno.land/x/dotenv/load.ts";
import { ensureFile } from "https://deno.land/std/fs/mod.ts";

import type {
  AirtableResp,
  Bases,
  BKWebFields,
  Endpoints,
  Records,
} from "./types.ts";

// Match table queries
const baseQueries: Bases = {
  Bookmarks: {
    Articles: [],
    Comics: [],
    Podcasts: [],
    Tweets: [],
    Videos: [],
  },
  Favorites: {
    Anime: [],
    Books: [],
    Movies: [],
    Shows: [],
    Games: [],
  },
  Media: {
    Books: [],
    Games: [],
    Movies: [],
    Shows: [],
    Tweets: [],
  },
  Records: {
    Clients: [],
    Jobs: [],
    Podcasts: [],
    RSS: [],
  },
};
const bookmarksList = Object.keys(baseQueries.Bookmarks);
const favoritesList = Object.keys(baseQueries.Favorites);
const mediaList = Object.keys(baseQueries.Media);
const recordsList = Object.keys(baseQueries.Records);

// Base endpoints
const endpoints: Endpoints = {
  Bookmarks: Deno.env.get("AIRTABLE_BOOKMARKS_ENDPOINT"),
  Favorites: Deno.env.get("AIRTABLE_FAVORITES_ENDPOINT"),
  Media: Deno.env.get("AIRTABLE_MEDIA_ENDPOINT"),
  Records: Deno.env.get("AIRTABLE_RECORDS_ENDPOINT"),
};

/**
 * Get bookmarks list from Airtable.
 * Request can be recursive is there is more than 100 records.
 * @function
 *
 * @param {string} base Airtable database
 * @param {string} list database list
 * @param {[string]} offset param to request remainding records
 * @return {Promise<AirtableResp >}
 */
const getBookmarksWithOffset = (
  base: string,
  list: string,
  offset?: string
): Promise<AirtableResp> => {
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
      .then((airtableRes: AirtableResp) => {
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
 * @param  {Records[]} records record object
 * @param  {string} base Airtable database
 * @param  {string} list database list
 * @return {Promise<void>}
 */
const saveBookmarks = async (
  records: Records[],
  base: string,
  list: string
): Promise<void> => {
  let fields = [];
  fields = records.map((record: Records) => record.fields);

  const category: string = base.toLowerCase();
  const record: string = list.toLowerCase();
  const filter = [
    record === "articles",
    record === "comics",
    record === "podcasts",
    record === "videos",
  ].includes(true);

  if (category === "bookmarks" && filter) {
    fields = fields.map((record) => {
      const data = record as BKWebFields;

      return {
        title: data.title,
        creator: data.creator,
        url: data.url,
        tags: data.tags,
      };
    });
  }

  try {
    // create file if doesn't exsit
    await ensureFile(`./records/${category}/${record}.json`);
    // write record to file
    await Deno.writeTextFile(
      `./records/${category}/${record}.json`,
      JSON.stringify(fields, undefined, 2)
    );

    console.info(`${base} saved`);
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

for (const list of favoritesList) {
  backup("Favorites", list);
}

for (const list of mediaList) {
  backup("Media", list);
}

for (const list of recordsList) {
  backup("Records", list);
}
