require('dotenv').config();
const { resolve } = require('path');
const { writeFile } = require('fs');
const axios = require('axios');

// Match table queries
const tableQueries = {
  bookmarks: `title creator url category`,
  books: `title author genre`,
  games: `title creator genre`,
  movies: `title director genre`,
  podcasts: `title url rss category`,
  rss: `title url rss category`,
  shows: `title director genre`,
};

// Get all items from table
const query = async table => {
  await axios({
    data: {
      query: `
        query {
          ${table} { ${tableQueries[table]} }
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
        console.error('Query Error:', result.data.errors[0].message);
      } else {
        writeFile(
          resolve(__dirname, '..', 'records', `${table}.json`),
          JSON.stringify(result.data.data[table], null, 2),
          err => {
            if (err) console.error(err);
            // eslint-disable-next-line no-console
            console.info(`Saved ${table}.json to Erebor backup.`);
          }
        );
      }
    })
    .catch(err => console.error('Request Error:', err));
};

Object.keys(tableQueries).forEach(table => query(table));
