require('dotenv').config();
const { resolve } = require('path');
const { writeFile } = require('fs');
const process = require('process');
const axios = require('axios');

// Match table queries
const tableQueries = {
  apps: 'title developer category ios macos',
  bookmarks: 'title creator url category',
  books: 'title author genre',
  games: 'title creator genre',
  movies: 'title director genre',
  podcasts: 'title url rss category',
  rss: 'title url rss category',
  shows: 'title director genre',
};

// Get all items from table
// eslint-disable-next-line no-restricted-syntax
for (const table of Object.keys(tableQueries)) {
  axios({
    data: {
      query: `
          query {
            ${table} { id ${tableQueries[table]} created_at updated_at }
          }
        `,
    },
    headers: {
      'Content-Type': 'application/json',
      'X-Hasura-Admin-Secret': process.env.EREBOR_KEY,
    },
    method: 'POST',
    url: process.env.EREBOR_ENDPOINT,
  })
    .then(result => {
      if (result.data.errors) {
        console.error('Erebor Query:', result.data.errors[0].message);
        process.exitCode = 1;
      } else {
        writeFile(
          resolve(__dirname, '..', 'records', `${table}.json`),
          JSON.stringify(result.data.data[table], null, 2),
          err => {
            if (err) {
              console.error('FS Error:', err);
              process.exitCode = 1;
            }
            // eslint-disable-next-line no-console
            console.info(`Saved ${table}.json to Erebor backup.`);
          }
        );
      }
    })
    .catch(err => {
      console.error('Erebor Request:', err);
      process.exitCode = 1;
    });
}
