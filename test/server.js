'use strict';

// Load modules
const Code = require('code');
const Lab = require('lab');
const addison = require('./lib/addison');

const lab = exports.lab = Lab.script();
const before = lab.before;

let server = null;

lab.experiment('Addison Engine server setup', () => {
  before(done => {
    addison.getServer()
      .then(addisonServer => {
        server = addisonServer;
        done();
      });
  });

  lab.test('Set up Addison Engine server', done => {
    Code.expect(server).to.not.be.null();
    done();
  });

  lab.test('Get swagger.json', done => {
    const options = {
      method: 'GET',
      url: '/swagger.json',
    };

    server.inject(options, response => {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.payload).to.contain('"swagger"');
      done();
    });
  });
});
