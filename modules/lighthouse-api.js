const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const Redis = require('ioredis');

const client = new Redis();

function launchChromeAndRunLighthouse(url, opts, config = null) {
  return chromeLauncher.launch({ chromeFlags: opts.chromeFlags }).then((chrome) => {
    opts.port = chrome.port;
    return lighthouse(url, opts, config).then((results) =>
      // use results.lhr for the JS-consumable output
      // https://github.com/GoogleChrome/lighthouse/blob/master/types/lhr.d.ts
      // use results.report for the HTML/JSON/CSV output as a string
      // use results.artifacts for the trace/screenshots/other specific case you need (rarer)
      chrome.kill().then(() => {
        client.set(url, results.report, () => {
          return results.lhr;
        });
      }));
  });
}

function getResults(url, opts) {
  return client.get(url, (err, data) => {
    if (err || data === null) {
      console.log( 'We need to get the data for ' + url);
      return launchChromeAndRunLighthouse(url, opts);
    }
    return data;
  });
}

module.exports = { getResults };
