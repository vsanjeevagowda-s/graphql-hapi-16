const graphql = require('graphql');
const PaintingType = require('./PaintingType');
const paintings = [{
  id: 1,
  name: 'sample1'
}, {
  id: 2,
  name: 'sample2'
}]
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
} = graphql;

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    painting: {
      type: PaintingType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args) {

        return paintings.filter(item => item.id === parseInt(args.id))[0];
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery
})