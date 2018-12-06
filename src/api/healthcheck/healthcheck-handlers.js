'use strict';

const AddisonEngine = require('@hpe/addison-engine');

function healthcheck (request, reply) {
  // Include whatever validation can check the health of critical application layers (e.g. database)
  // This endpoint can then be used to set up regular monitoring using SiteScope

  // Build an object to be returned that can contain more details (e.g. answer from each component)
  // Default is to return an 'ok' status (and HTTP status code 200) as this endpoint could answer
  reply({
    status: 'ok',
    clientId: AddisonEngine.getClientId(),
    environment: AddisonEngine.getEnvironment(),
    pid: process.pid,
  });
}

exports.healthcheck = healthcheck;
