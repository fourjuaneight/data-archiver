const { readFileSync } = require('fs');
const { resolve } = require('path');
const axios = require('axios');
const dotenv = require('dotenv').config({
  path: resolve(process.cwd(), '.env'),
});

const timeData = JSON.parse(
  readFileSync(resolve(__dirname, 'december.json'), 'utf8')
);

timeData.forEach(obj => {
  setTimeout(
    () =>
      axios({
        data: {
          query: `
              mutation TimeMutation {
                insert_time(objects: {
                  group: "${obj.group}",
                  task: "${obj.task}",
                  start: "${obj.start}",
                  finish: "${obj.finish}",
                  duration: "${obj.duration}"
                  created_at: "${obj.created_at}",
                  updated_at: "${obj.updated_at}",
                }) {
                  returning {
                    task
                    created_at
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
        // eslint-disable-next-line no-console
        .then(result => console.log(result.data))
        .catch(error => console.error(error)),
    1500
  );
});
