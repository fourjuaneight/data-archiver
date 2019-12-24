const { readFileSync } = require('fs');
const { join, resolve } = require('path');
const axios = require('axios');
const dotenv = require('dotenv').config({
  path: resolve(process.cwd(), '.env'),
});

const timeData = JSON.parse(readFileSync(join(__dirname, 'time.json'), 'utf8'));

timeData.forEach(
  obj =>
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
      .catch(error => console.error(error)) // eslint-disable-line
);
