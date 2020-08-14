const WebSocket = require('ws');
const { createServer } = require('./http-server.js');
let socketServer;

/**
 * Creates socketServer
 * @param {Object} options
 * @param {Number} options.port
 */
function create(options) {
  const httpServer = createServer(options);
  const wss = new WebSocket.Server({ server: httpServer });
  console.log('Socket Server Listening...');
  wss.on('connection', (ws) => {
    if (!socketServer) console.log('>> Watcher Connected');
    socketServer = ws;
  });
}

/**
 * Reloads the page
 */
function reload() {
  if (socketServer) {
    socketServer.send('abell-dev-server-reload');
  }
}

module.exports = {
  create,
  reload
};
