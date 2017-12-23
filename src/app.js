import Koa from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-bodyparser';
import cors from 'kcors';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { makeExecutableSchema } from 'graphql-tools';
import depthLimit from 'graphql-depth-limit';

import typeDefs from './schema.gql';
import resolvers from './resolvers';
import { isDevelopment, endpointURL } from './config';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

const app = new Koa();
const router = new Router();

app.use(koaBody());
app.use(cors());

router.all(
  endpointURL,
  graphqlKoa(ctx => ({
    schema,
    context: {
      user: ctx.user,
      lang: 'en'
    },
    validationRules: [depthLimit(2)],
    debug: false
  }))
);

if (isDevelopment) {
  router.get(
    '/graphiql',
    graphiqlKoa({
      endpointURL
    })
  );
}

app.use(router.routes()).use(router.allowedMethods());

export default app;
