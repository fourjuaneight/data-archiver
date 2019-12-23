#!/usr/bin / env node

const { resolve } = require('path');
const axios = require('axios');
const dotenv = require('dotenv').config({
  path: resolve(process.cwd(), '.env'),
});

axios({
  data: {
    query: `
            mutation TimeMutation {
              insert_time(objects: {
                created_at: "${obj.Date}T${obj.Start}",
                updated_at: "${obj.Date}T${obj.Finish}",
                group: "${obj.Group}",
                task: "${obj.Task}",
                start: "${obj.Date}T${obj.Start}",
                finish: "${obj.Date}T${obj.Finish}",
                duration: "${obj.Duration}"
              }) {
                returning {
                  task
                }
              }
            }
          `,
  },
  headers: {
    'Content-Type': 'application/json',
    'X-Hasura-Admin-Secret': dotenv.parsed.EREBOR_KEY,
  },
  method: 'POST',
  url: dotenv.parsed.EREBOR_ENDPOINT,
})
  .then(result => console.info(result.data)) // eslint-disable-line
  .catch(error => console.error(error));
