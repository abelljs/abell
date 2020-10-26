/**
 * Tests: src/abell-dev-server/
 */

const fs = require('fs');
const path = require('path');
const net = require('net');

const fetch = require('node-fetch');
const cheerio = require('cheerio');

const devServer = require('../src/abell-dev-server');
const adsHttpServer = require('../src/abell-dev-server/http-server.js');

const demoPath = path.join(__dirname, 'demos');
const examplePath = path.join(demoPath, 'test-dev-server');

const SERVER_DEFAULT_PORT = 5000;

// setup helpers

describe('src/abell-dev-server', () => {
  let serverInstance;

  beforeAll(() => {
    process.chdir(examplePath);
  });

  afterAll(() => {
    process.chdir(__dirname);
  });

  afterEach(() => {
    if (serverInstance.httpServer) {
      serverInstance.httpServer.close();
      serverInstance.wss.close();
    }
  });

  it('starts and responds on default port', async () => {
    serverInstance = await devServer.create({
      path: process.cwd()
    });

    fs.writeFileSync(
      path.join(process.cwd(), 'index.html'),
      '<h1>Hello World</h1>'
    );

    let res = await fetch(`http://localhost:${SERVER_DEFAULT_PORT}`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/html');

    let text = await res.text();
    let parsed = cheerio.load(text);
    expect(parsed('h1').text()).toBe('Hello World');
    // websocket injects javascript to the page that is being hosted
    expect(parsed('script').length).toBe(1);

    // test if reloading dev server works
    fs.writeFileSync(
      path.join(process.cwd(), 'index.html'),
      '<h1>Change Triggered</h1>'
    );

    devServer.reload();
    res = await fetch(`http://localhost:${SERVER_DEFAULT_PORT}`);
    text = await res.text();
    parsed = cheerio.load(text);

    expect(parsed('h1').text()).toBe('Change Triggered');
    expect(parsed('script').length).toBe(1);

    fs.writeFileSync(
      path.join(process.cwd(), 'index.html'),
      '<h1>Hello World</h1>'
    );
  });

  it('should start on the next port if default port is occupied', async () => {
    const dummyServer = net.createServer();
    dummyServer.listen(SERVER_DEFAULT_PORT);

    serverInstance = await devServer.create({
      path: process.cwd()
    });

    const expectedPort = SERVER_DEFAULT_PORT + 1;
    expect(serverInstance.httpServer.address().port).toBe(expectedPort);
    expect(serverInstance.wss.address().port).toBe(expectedPort);

    const res = await fetch(`http://localhost:${expectedPort}`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/html');
    dummyServer.close();
  });

  it('should exit after 3 retries', async () => {
    const tempProcessExit = process.exit;
    const tempConsoleError = console.error;

    process.exit = jest.fn((exitCode) => exitCode);
    console.error = jest.fn((message) => message);

    serverInstance = await adsHttpServer.createServer(
      { port: SERVER_DEFAULT_PORT },
      { count: 4 }
    );

    expect(console.error.mock.results[0].value).toBe(
      'Max retries for port finding exceeded. Exiting..'
    );

    expect(process.exit.mock.results[0].value).toBe(1);

    process.exit = tempProcessExit;
    console.error = tempConsoleError;
    serverInstance.close();
  });
});
