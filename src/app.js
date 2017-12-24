import Koa from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-bodyparser';
import cors from 'kcors';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { makeExecutableSchema } from 'graphql-tools';
import depthLimit from 'graphql-depth-limit';
import path from 'path';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';

import { isDevelopment, endpointURL, jwtSecret1, jwtSecret2 } from './config';
import models from './models';

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schemas')));

const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, './resolvers'))
);

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
      models,
      user: {
        id: 1
      },
      jwtSecret1,
      jwtSecret2
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
