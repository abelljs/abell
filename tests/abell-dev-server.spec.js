const devServer = require('../src/abell-dev-server');
const expect = require('chai').expect;
const fetch = require('node-fetch');
const path = require('path');
const cheerio = require('cheerio');

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

  it('can start and responds on default port ', async () => {
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
});
