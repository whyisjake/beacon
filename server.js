const Hapi = require('hapi');
const lighthouseApi = require('./modules/lighthouse-api');

// create a server with a host and port
const server = new Hapi.Server({
  host: 'localhost',
  port: 3101,
});

server.route({
  method: 'GET',
  path: '/',
  handler: (request, h) => 'I am the home route', // eslint-disable-line no-unused-vars
});

server.route({
  method: 'GET',
  path: '/example',
  handler: (request, h) => { // eslint-disable-line no-unused-vars
    const opts = {
      chromeFlags: ['--headless'],
    };
    // console.log(request.url.searchParams.URLSearchParams);
    return lighthouseApi.getResults('https://conde.io', opts);
  },
});

// define server start function
async function start() {
  try {
    await server.start(); // the builtin server.start method is async
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    process.exit(1);
  }

  console.log('Server running at: ', server.info.uri); // eslint-disable-line no-console
}

// start your server
start();
