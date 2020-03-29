const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const redis = require('redis');

const client = redis.createClient();

function launchChromeAndRunLighthouse(url, opts, config = null) {
  return chromeLauncher.launch({ chromeFlags: opts.chromeFlags }).then((chrome) => {
    opts.port = chrome.port;
    return lighthouse(url, opts, config).then((results) =>
      // use results.lhr for the JS-consumable output
      // https://github.com/GoogleChrome/lighthouse/blob/master/types/lhr.d.ts
      // use results.report for the HTML/JSON/CSV output as a string
      // use results.artifacts for the trace/screenshots/other specific case you need (rarer)
      chrome.kill().then(() => {
        client.set(url, results.report);
        return results.lhr;
      }));
  });
}

function getResults(url, opts) {
  return client.get(url, (err, data) => {
    if (err || data === null) {
      launchChromeAndRunLighthouse(url, opts);
    }
    console.log(data);
    // How do I return this here?
    return data;
  });
}

module.exports = { getResults };
