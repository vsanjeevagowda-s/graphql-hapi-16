const graphql = require('graphql');
const { GraphQLObjectType, GraphQLInt } = graphql;

const PaintingType = new GraphQLObjectType({
  name: 'Painting',
  fields: () => ({
    id: { type: GraphQLInt }
  })
})

module.exports = PaintingType;