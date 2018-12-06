const fs = require('fs');
const encoding = 'utf8';

module.exports = {
  connections: [{
    host: process.env.ADDISON_HOST,
    port: process.env.ADDISON_PORT,
    routes: {
      log: true,
    },
    tls: {
      key: fs.readFileSync(`${process.env.NODE_PATH}/ssl/server.key`, encoding),
      cert: fs.readFileSync(`${process.env.NODE_PATH}/ssl/server.crt`, encoding),
    },
  }],
};
