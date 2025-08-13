// graphql/index.js
const { ApolloServer, gql } = require('apollo-server');
const { campaigns } = require('./data');
const { GraphQLError } = require('graphql');

/*
 This server intentionally simulates the "hidden trap":
 - For some requests (deterministic random), it returns partial data
   but also returns an errors array (GraphQL's errors field)
 - Candidates must handle this (render available data + show non-blocking error)
*/

const typeDefs = gql`
  type Donor {
    name: String!
    amount: Int!
  }

  type Campaign {
    id: ID!
    name: String
    goal: Int
    currentAmount: Int
    description: String
    imageUrl: String
    donors: [Donor!]
  }

  type Query {
    campaign(id: ID!): Campaign
  }
`;

const resolvers = {
  Query: {
    campaign: (_, { id }) => {
      const item = campaigns.find(c => c.id === id);
      if (!item) return null;
      // Simulate partial errors: use id last char to deterministically cause partials
      // e.g., campaign id '1' -> produce partial 1/3 of the time
      const lastDigit = Number(String(id).slice(-1)) || 0;
      const chance = (lastDigit % 3) === 0 ? 0.5 : 0.2;

      if (Math.random() < chance) {
        // Return partial object; we'll throw or return a GraphQLError for a field
        // Apollo will include errors array and still include 'data'
        // We'll attach an extension on the error to make it realistic.
        throw new GraphQLError('Partial data: donors could not be loaded', {
          extensions: { code: 'DONORS_PARTIAL_FAILURE' }
        });
      }

      return item;
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

const PORT = process.env.GRAPHQL_PORT || 4001;
server.listen({ port: PORT }).then(({ url }) => {
  console.log(`GraphQL server ready at ${url}`);
});
