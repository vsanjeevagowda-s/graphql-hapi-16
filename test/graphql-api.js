'use strict';

const Code = require('code');
const Lab = require('lab');
const addison = require('./lib/addison');

const lab = exports.lab = Lab.script();
const before = lab.before;

let server = null;


lab.experiment('Tests for get', () => {
  before(done => {
    addison.getServer()
      .then(addisonServer => {
        server = addisonServer;
        done();
      });
  });

  lab.test('Test for get method', done => {
    const options = {
      method: 'GET',
      url: '/graphql-api',
    };

    server.inject(options, response => {
      Code.expect(response.payload).to.equal('Hello from get /graphql-api');
      Code.expect(response.statusCode).to.equal(200);
      done();
    });
  });
});

