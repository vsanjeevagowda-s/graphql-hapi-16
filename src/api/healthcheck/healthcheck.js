'use strict';

const Handlers = require('./healthcheck-handlers.js');
const routes = [];

exports.register = function (server, options, next) {
  routes.forEach(route => server.route(route));
  next();
};

exports.register.attributes = require('./package');

routes.push({
  method: 'GET',
  path: '/healthcheck',
  config: {
    description: 'Health check endpoint',
    notes: 'Can be used to monitor health check of application, e.g. with Sitescope',
    security: {
      xframe: 'sameorigin',
    },
    cache: {
      otherwise: 'no-cache, no-store, must-revalidate',
    },
  },
  handler: Handlers.healthcheck,
});
