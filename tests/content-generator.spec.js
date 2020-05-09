const expect = require('chai').expect;

const { 
  getBaseProgramInfo
} = require('../src/content-generator.js');


describe('getBaseProgramInfo()', () => {
  it('should return the base info for program to execute', () => {
    process.chdir("tests/resources/test_demo");

    expect(getBaseProgramInfo())
      .to.be.an('object')
      .to.have.keys([
        'abellConfigs', 'contentTemplate', 'contentList', 
        'contentDirectories', 'globalMeta', 'logs', 'templateExtension'
      ])

    process.chdir("../../..");
  })
})
