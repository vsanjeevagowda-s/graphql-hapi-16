const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString } = graphql;
debugger
const PaintingType = new GraphQLObjectType({
  name: 'Painting',
  fields: () => ({
    id: { type: GraphQLString }
  })
})
debugger
module.exports = PaintingType;