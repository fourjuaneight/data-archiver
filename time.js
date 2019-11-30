#!/usr/bin/env node

const { readdir, writeFileSync } = require('fs');
const { join } = require('path');
const csv = require('csvtojson');

const time = join(__dirname, 'time');

readdir(time, (err, files) => {
  if (err) {
    throw err;
  }
  files.map(month => {
    const jsonName = month.replace(/csv/g, 'json');
    csv()
      .fromFile(`${time}/${month}`)
      .then(jsonObj =>
        writeFileSync(
          join(__dirname, 'time', jsonName),
          JSON.stringify(jsonObj, undefined, 2),
          'utf8'
        )
      );
  });
});
