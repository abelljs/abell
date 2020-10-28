/**
 * Tests: src/abell-dev-server/
 */

const path = require('path');
const net = require('net');

const fetch = require('node-fetch');
const cheerio = require('cheerio');

const devServer = require('../src/abell-dev-server');
const adsHttpServer = require('../src/abell-dev-server/http-server.js');
const serve = require('../src/commands/serve');

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
    if (serverInstance && serverInstance.httpServer) {
      serverInstance.httpServer.close();
      serverInstance.wss.close();
    }
  });

  it('should call socketServer.send function', () => {
    expect(devServer.reload.toString()).toContain(
      "socketServer.send('abell-dev-server-reload')"
    );
  });

  it('should run an abell-dev-server and trigger reload', async () => {
    const tempCWD = process.cwd();
    const tempConsoleLog = console.log;
    const mainExample = path.join(demoPath, 'test-example-main');

    process.chdir(mainExample);
    serverInstance = await serve({
      port: SERVER_DEFAULT_PORT,
      ignorePlugins: true
    });

    console.log = jest.fn((message) => message);
    // abell.config.js - change
    await serverInstance.listeners[0]._events.change();
    // 'content' - all
    await serverInstance.listeners[1]._events.all(
      'change',
      path.resolve(path.join('content', 'deep', 'extra-deep', 'index.md'))
    );
    // 'theme' - all
    await serverInstance.listeners[2]._events.all(
      'change',
      path.resolve(path.join('theme', 'about.abell'))
    );

    expect(console.log.mock.results.map((result) => result.value)).toEqual([
      '\n⚙️  Abell Config Changed',
      '\u001b[1m\u001b[32m>\u001b[39m\u001b[22m Site Rebuilt',
      "\n📄 Event 'change' in content/deep/extra-deep/index.md",
      '\u001b[1m\u001b[32m>\u001b[39m\u001b[22m Rebuilt deep/extra-deep',
      "\n💅 Event 'change' in theme/about.abell",
      '\u001b[1m\u001b[32m>\u001b[39m\u001b[22m Files Rebuilt'
    ]);

    process.chdir(tempCWD);
    serverInstance.httpServer.close();
    serverInstance.wss.close();
    console.log = tempConsoleLog;
    for (const listener of serverInstance.listeners) {
      listener.close();
    }
  });

  it('starts and responds on default port', async () => {
    serverInstance = await devServer.create({
      path: process.cwd()
    });

    const res = await fetch(`http://localhost:${SERVER_DEFAULT_PORT}`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/html');

    const text = await res.text();
    const parsed = cheerio.load(text);
    expect(parsed('h1').text()).toBe('Hello World');
    // websocket injects javascript to the page that is being hosted
    expect(parsed('script').length).toBe(1);
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
