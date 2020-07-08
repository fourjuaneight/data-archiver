require('dotenv').config();
const { resolve } = require('path');
const { writeFile } = require('fs');
const process = require('process');
const axios = require('axios');

// Match table queries
const baseQueries = {
  Bookmarks: ['Articles', 'Comics', 'Podcasts', 'Reddits', 'Tweets', 'Videos'],
  Media: ['Apps', 'Books', 'Games', 'Movies', 'Podcasts', 'RSS', 'Shows'],
};

// Get all items from table
// eslint-disable-next-line no-restricted-syntax
for (const base of Object.keys(baseQueries)) {
  // eslint-disable-next-line no-restricted-syntax
  for (const list of Object.keys(baseQueries[base])) {
    axios({
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
      url: `${process.env[`AIRTABLE_${base.toUpperCase()}_ENDPOINT`]}/${
        baseQueries[base][list]
      }?maxRecords=1000`,
    })
      .then(result => {
        if (result.error) {
          console.error(`${result.error.type}:`, result.error.message);
          process.exitCode = 1;
        } else {
          const fields = result.data.records.map(record => record.fields);
          const record = baseQueries[base][list].toLowerCase();
          writeFile(
            resolve(__dirname, '..', 'records', `${record}.json`),
            JSON.stringify(fields, null, 2),
            err => {
              if (err) {
                console.error('FS Error:', err);
                process.exitCode = 1;
              }
              // eslint-disable-next-line no-console
              console.info(`Saved ${record}.json to Airtable backup.`);
            }
          );
        }
      })
      .catch(err => {
        console.error('Airtable Request:', err);
        process.exitCode = 1;
      });
  }
}
