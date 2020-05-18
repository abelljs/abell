const WebSocket = require('ws');
const { createServer } = require('./http-serve.js');
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
  wss = new WebSocket.Server({ port: options.socketPort || 8080 });
  console.log('Socket Server Listening...');
  wss.on('connection', (ws) => {
    if (!server) console.log('>> Watcher Connected');
    server = ws;
  });
}

/**
 * Reloads the page
 */
function reload() {
  if (server) {
    server.send('abell-dev-server-reload');
  }
}

/**
 * Replaces the content
 * @param {Object} contentData
 * @param {String} contentData.slug - slug of blog
 * @param {String} contentData.newContent - New content to add to body of the page.
 */
function experimentalContentReplace(contentData) {
  if (server) {
    server.send(
      JSON.stringify({
        message: 'abell-dev-server-content-replace',
        info: contentData,
      })
    );
  }
}

module.exports = {
  create,
  reload,
  experimentalContentReplace,
};
