'use strict';

const Joi = require('joi');
const Handlers = require('./graphql-api-handlers.js');
const routes = [];
const { graphqlHapi, graphiqlHapi } = require('apollo-server-hapi');
const schema = require('./schema');

exports.register = function (server, options, next) {
  debugger
  server.register({
    register: graphqlHapi,
    options: {
      path: '/graphql',
      graphqlOptions: {
        schema: schema,
      },
      route: {
        cors: true
      }
    },
  });

  server.register({
    register: graphiqlHapi,
    options: {
      path: '/graphiql',
      graphiqlOptions: {
        endpointURL: 'graphql'
      },
      route: {
        cors: true
      }
    },
  });
  
  next();
};

exports.register.attributes = require('./package');

routes.push({
  method: 'GET',
  path: '/graphql-api',
  config: {
    description: 'Test Description',
    notes: 'Test Notes',
    tags: ['api'],
    security: {
      xframe: 'sameorigin',
    },
    cache: {
      otherwise: 'no-cache, no-store, must-revalidate',
    },
  },
  handler: Handlers.getGraphqlApi,
});

