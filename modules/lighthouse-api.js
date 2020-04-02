const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const Redis = require('ioredis');
const resizer = require('../lib/iframeResizer.contentWindow.min.js');

const client = new Redis();

function launchChromeAndRunLighthouse(url, opts, config = null) {
  return chromeLauncher.launch({ chromeFlags: opts.chromeFlags }).then((chrome) => {
    opts.port = chrome.port; // eslint-disable-line no-param-reassign
    return lighthouse(url, opts, config).then((results) =>
      // use results.lhr for the JS-consumable output
      // https://github.com/GoogleChrome/lighthouse/blob/master/types/lhr.d.ts
      // use results.report for the HTML/JSON/CSV output as a string
      // use results.artifacts for the trace/screenshots/other specific case you need (rarer)
      // The resizer script is allows some comms between the iframe window so it can be resized.
      chrome.kill().then(() => { // eslint-disable-line implicit-arrow-linebreak
        client.set(url, results.report + resizer.script, () => results.lhr);
      }));
  });
}

function getResults(url, opts) {
  return client.get(url, (err, data) => {
    if (err || data === null) {
      console.log(`We need to get the data for ${url}`); // eslint-disable-line no-console
      return launchChromeAndRunLighthouse(url, opts);
    }
    return data;
  });
}

module.exports = { getResults };
