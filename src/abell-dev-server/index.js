const WebSocket = require('ws');
const { createServer } = require('./http-server.js');
const socketServers = {};

/**
 * Creates socketServer
 * @param {Object} options
 * @param {Number} options.port
 */
async function create(options) {
  const httpServer = await createServer(options);
  const wss = new WebSocket.Server({ server: httpServer });
  console.log('Socket Server Listening...');
  wss.on('connection', (ws, req) => {
    const remoteAddress = req.connection.remoteAddress;
    if (!socketServers[remoteAddress]) console.log('>> Watcher Connected');
    socketServers[remoteAddress] = ws;
  });
  return { httpServer, wss };
}

/**
 * Reloads the page
 */
function reload() {
  if (Object.keys(socketServers).length > 0) {
    for (const socketServer of Object.values(socketServers)) {
      socketServer.send('abell-dev-server-reload');
    }
  }
}

module.exports = {
  create,
  reload
};
