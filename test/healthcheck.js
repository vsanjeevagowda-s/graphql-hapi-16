'use strict';

const Code = require('code');
const Lab = require('lab');
const addison = require('./lib/addison');

const lab = exports.lab = Lab.script();
const before = lab.before;

let server = null;

lab.experiment('Health check API', () => {
  before(done => {
    addison.getServer()
      .then(addisonServer => {
        server = addisonServer;
        done();
      });
  });

  lab.test('Responds successfully with a JSON payload having a "status" property of "OK"', done => {
    const options = {
      method: 'GET',
      url: '/healthcheck',
    };

    server.inject(options, response => {
      let jsonPayload = {};

      try {
        jsonPayload = JSON.parse(response.payload);
      } catch (ex) {
        Code.expect(ex.message).to.not.exist();
      }

      Code.expect(jsonPayload.status).to.equal('ok');
      Code.expect(response.statusCode).to.equal(200);
      done();
    });
  });
});
