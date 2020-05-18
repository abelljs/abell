const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

/**
 * @typedef {Object} Options
 * @property {Number} port
 * @property {Number} socketPort
 * @property {String} path
 * @property {String} logs - Possible values: complete, minimum, no
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
  '.doc': 'application/msword',
};

/**
 *
 * @param {Request} req request object
 * @param {Response} res response object
 * @param {String} socketCode client-side code of web sockets
 * @param {Options} options
 */
function server(req, res, socketCode, options) {
  // eslint-disable-next-line
  // Copied from https://stackoverflow.com/questions/16333790/node-js-quick-file-server-static-files-over-http

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (options.logs === 'complete') {
    console.log(`${req.method} ${req.url}`);
  }

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
    let contentData = data;
    if (ext === '.html') {
      contentData += socketCode;
    }
    res.setHeader('Content-Type', contentTypeMap[ext] || 'text/plain');
    res.end(contentData);
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
  const socketCode = /* html */ `
  <script>
    const url = 'ws://localhost:${options.socketPort}';
    const connection = new WebSocket(url);
    connection.addEventListener('message', e => {
      if (e.data === 'abell-dev-server-reload') {
        location.reload();
      }
    });
  </script>
  `;

  http
    .createServer((req, res) => server(req, res, socketCode, options))
    .listen(parseInt(port));
  console.log(`Server listening on port ${port}`);
}

module.exports = {
  createServer,
};
