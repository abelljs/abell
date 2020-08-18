const devServer = require('../src/abell-dev-server');
const expect = require('chai').expect;
const fetch = require('node-fetch');
const path = require('path');
const cheerio = require('cheerio');
const net = require('net');
const sinon = require('sinon');

const SERVER_DEFAULT_PORT = 5000;

describe('Abell Dev Server', () => {
  let serverInstance;
  beforeEach(async () => {
    process.chdir(
      path.join(__dirname, 'test-utils', 'resources', 'test_dev_server')
    );
  });
  afterEach(() => {
    serverInstance.httpServer.close();
    serverInstance.wss.close();
    process.chdir(__dirname);
  });

  it('starts and responds on default port ', async () => {
    serverInstance = await devServer.create({
      path: path.join(process.cwd())
    });

    const res = await fetch(`http://localhost:${SERVER_DEFAULT_PORT}`);

    expect(res.status).to.be.eq(200);
    expect(res.headers.get('content-type')).to.be.eq('text/html');
    const textPage = await res.text();

    const parsed = cheerio.load(textPage);
    expect(parsed('h1').text()).to.be.eq('Hello World');
    expect(parsed('script').length).to.be.eq(1);
  });

  it('starts on the next port if default port is occupied', async () => {
    const dummyServer = net.createServer();
    dummyServer.listen(SERVER_DEFAULT_PORT);

    serverInstance = await devServer.create({
      path: path.join(process.cwd())
    });

    const nextPort = SERVER_DEFAULT_PORT + 1;
    expect(serverInstance.httpServer.address().port).to.be.eq(nextPort);
    expect(serverInstance.wss.address().port).to.be.eq(nextPort);

    const res = await fetch(`http://localhost:${nextPort}`);
    expect(res.status).to.be.eq(200);
    dummyServer.close();
  });

  it('exits finding ports after 3 retries', async () => {
    const serverInstances = [];
    for (let i = 0; i <= 3; i++) {
      const dummyServer = net.createServer();
      dummyServer.listen(SERVER_DEFAULT_PORT + i);
      serverInstances.push(dummyServer);
    }
    sinon.stub(process, 'exit');

    serverInstance = await devServer.create({
      path: path.join(process.cwd())
    });
    expect(process.exit.calledWith(1)).to.be.true;
    serverInstances.forEach((ins) => ins.close());
  });
});
