const http = require('node:http');
const { readConfig } = require('./lib/config');
const { openStore } = require('./lib/db');
const { createHandler } = require('./lib/handler');

const LOCALHOST = '127.0.0.1';

const config = readConfig(process.env);
const store = openStore(config.dbFile);
const server = http.createServer(createHandler({ store, config }));

server.listen(config.port, LOCALHOST, () => {
  console.log('taklifnoma api listening on ' + LOCALHOST + ':' + config.port);
});

function shutdown() {
  server.close(() => {
    store.close();
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
