const tweetID = inputData.twtID;
const fetchOps = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Travis-API-Version": "3",
    Authorization: "token xxx",
  },
  body: JSON.stringify({
    request: {
      config: {
        env: {
          jobs: [`TWEET_ID=${tweetID}`],
        },
      },
    },
  }),
};

fetch("https://api.travis-ci.com/repo/fourjuaneight%2Fdata/requests", fetchOps)
  .then((res) => res.text())
  .then((text) => {
    callback(null, { id: tweetID, ci: text });
  })
  .catch((error) => {
    callback(error);
  });
