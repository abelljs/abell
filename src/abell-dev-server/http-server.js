const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const isPortTaken = function (port) {
  return new Promise((resolve, reject) => {
    const net = require('net');
    const tester = net
      .createServer()
      .once('error', function (err) {
        if (err.code === 'EADDRINUSE')
          return resolve({ success: false, port: null });
        return reject(err);
      })
      .once('listening', function () {
        tester
          .once('close', function () {
            resolve({ success: true, port });
          })
          .close();
      })
      .listen(port);
  });
};

/**
 * @typedef {Object} Options
 * @property {Number} port
 * @property {String} path
 * @property {String} logs - Possible values: complete, minimum, no
 */

const contentTypeMap = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
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
  if (ext === '' && fs.existsSync(pathname + '.html')) {
    // cleanURLs: if path is /example, it will request the /example.html
    ext = '.html';
    pathname = pathname + '.html';
  }

  if (!fs.existsSync(pathname)) {
    // if the file is not found, return 404
    res.statusCode = 404;
    res.end(`File ${pathname} not found!`);
    return;
  }

  // if is a directory search for index file matching the extention
  if (fs.statSync(pathname).isDirectory()) {
    ext = '.html';
    pathname += '/index.html';
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
 * @param {Options} retry
 * @return {Object} httpServer
 */
async function createServer(options, retry) {
  if (retry && retry.count > 3) {
    console.error('Max retries for port finding exceeded. Exiting..');
    process.exit(1);
  }

  const port = (retry && retry.nextPort) || (options && options.port) || 5000;
  const socketCode = /* html */ `
  <script>
    const socketProtocol = location.protocol === 'http:' ? 'ws://' : 'wss://';
    const url = socketProtocol + location.host;
    const connection = new WebSocket(url);
    connection.addEventListener('message', e => {
      if (e.data === 'abell-dev-server-reload') {
        location.reload();
      }
    });
  </script>
  `;
  let httpServer;

  // retry if and only if we are using the default port
  if (!options.port) {
    const result = await isPortTaken(port);

    if (!result.success) {
      console.log(`Port ${port} is taken!! Retrying with port ${port + 1}`);
      httpServer = createServer(options, {
        nextPort: port + 1,
        count: retry ? retry.count + 1 : 1
      });
    } else {
      httpServer = http
        .createServer((req, res) => server(req, res, socketCode, options))
        .listen(parseInt(result.port));
      console.log(`Server listening on port ${result.port}`);
    }
  } else {
    httpServer = http
      .createServer((req, res) => server(req, res, socketCode, options))
      .listen(parseInt(options.port));
    console.log(`Server listening on port ${options.port}`);
  }
  return httpServer;
}

module.exports = {
  createServer
};
