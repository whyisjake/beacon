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
  path: '/search',
  handler: async (request, h) => { // eslint-disable-line no-unused-vars
    const opts = {
      chromeFlags: ['--headless'],
    };
    const { url } = request.query;
    const audits = await lighthouseApi.getResults(url, opts);
    const response = h.response(audits);
    response.header('content-type', 'application/json');
    return response;
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
