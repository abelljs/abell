const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

/**
 * @typedef {Object} Options
 * @property {Number} port
 * @property {Number} socketPort
 * @property {String} path
 */

const contentTypeMap = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword'
};

/**
 * 
 * @param {Request} req request object
 * @param {Response} res response object
 * @param {String} socketCode client-side code of web sockets
 * @param {Options} options
 */
function server(req, res, socketCode, options) {
  console.log(`${req.method} ${req.url}`);

  // parse URL
  const parsedUrl = url.parse(req.url);
  // extract URL path
  let pathname = path.join(options.path, parsedUrl.pathname);
  // based on the URL path, extract the file extention. e.g. .js, .doc, ...
  let ext = path.parse(pathname).ext;
  // maps file extention to MIME typere
  if (ext === '') {
    ext = '.html';
  }

  if (!fs.existsSync(pathname)) {
    // if the file is not found, return 404
    res.statusCode = 404;
    res.end(`File ${pathname} not found!`);
    return;
  }

  // if is a directory search for index file matching the extention
  if (fs.statSync(pathname).isDirectory()) {
    pathname += '/index' + ext;
  }

  // read file from file system
  try {
    const data = fs.readFileSync(pathname);
    // if the file is found, set Content-type and send data
    res.setHeader('Content-type', contentTypeMap[ext] || 'text/plain' );
    res.end(data + socketCode);
  } catch (err) {
    res.statusCode = 500;
    res.end(`Error getting the file: ${err}.`);
  }
}

/**
 * 
 * @param {Options} options 
 */
function createServer(options) {
  const port = options.port || 9000;
  const socketCode = `
  <script>
    const url = 'ws://localhost:${options.socketPort}';
    const connection = new WebSocket(url);
    connection.addEventListener('message', e => {
      location.reload();
    });
  </script>
  `;

  http.createServer((req, res) => server(req, res, socketCode, options))
    .listen(parseInt(port));
  console.log(`Server listening on port ${port}`);
}

module.exports = {
  createServer
};
