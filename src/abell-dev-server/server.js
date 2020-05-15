const WebSocket = require('ws');
const {createServer} = require('./http-serve.js');
let server;
let wss;

/**
 * Creates server
 * @param {Object} options 
 * @param {Number} options.port
 * @param {Number} options.socketPort
 */
function create(options) {
  createServer(options);
  wss = new WebSocket.Server({port: options.socketPort || 8080});
  console.log('Socket Server Listening...');
  wss.on('connection', ws => {
    if (!server) console.log('Connected');
    server = ws;
  });
};

/**
 * Reloads the page
 */
function reload() {
  if (server) {
    server.send('abell-dev-server');
  }
};

module.exports = {
  create,
  reload
};
