const Hapi = require('hapi');
const server = new Hapi.Server();
const { graphqlHapi, graphiqlHapi } = require('apollo-server-hapi');
debugger
const schema = require('./graphql/schema');
debugger
server.connection({
  port: 4000,
  host: 'localhost'
});

const init = async () => {
  await server.register({
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

await server.register({
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

  await server.start();
  console.log(`Server is running at ${server.info.uri}`)
}
init();