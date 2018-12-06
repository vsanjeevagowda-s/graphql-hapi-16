'use strict';

const AddisonEngine = require('@hpe/addison-engine');
const serverOptions = {
  environment: 'unit-test',
};

function startServer() {
  return new Promise((resolve, reject) => {
    AddisonEngine.startAddisonServer(serverOptions, (err, server) => {
      if (err) return reject(err);
      resolve(server);
    });
  });
}

function getServer() {
  const addisonServer = AddisonEngine.getServer();

  if (addisonServer === undefined) {
    return startServer();
  }

  return Promise.resolve(addisonServer);
}

module.exports.getServer = getServer;
