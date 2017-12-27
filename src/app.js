import Koa from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-bodyparser';
import cors from 'kcors';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { makeExecutableSchema } from 'graphql-tools';
import depthLimit from 'graphql-depth-limit';
import path from 'path';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import jwt from 'jsonwebtoken';

import {
  isDevelopment,
  endpointURL,
  jwtSecret1,
  jwtSecret2,
  subscriptionsEndpoint
} from './config';
import models from './models';
import { refreshTokens } from './auth';

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schemas')));

const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, './resolvers'))
);

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

const app = new Koa();
const router = new Router();

app.use(koaBody());
app.use(cors());
app.use(async (ctx, next) => {
  const token = ctx.headers['x-token'];
  if (token) {
    try {
      const { user } = jwt.verify(token, jwtSecret1);
      ctx.user = user;
    } catch (err) {
      const refreshToken = ctx.headers['x-refresh-token'];
      const newTokens = await refreshTokens(
        token,
        refreshToken,
        models,
        jwtSecret1,
        jwtSecret2
      );
      if (newTokens.token && newTokens.refreshToken) {
        ctx.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
        ctx.set('x-token', newTokens.token);
        ctx.set('x-refresh-token', newTokens.refreshToken);
      }
      ctx.user = newTokens.user;
    }
  }
  await next();
});

router.all(
  endpointURL,
  graphqlKoa(ctx => ({
    schema,
    context: {
      models,
      user: ctx.user,
      // user: { id: 1 },
      jwtSecret1,
      jwtSecret2
    },
    validationRules: [depthLimit(3)],
    debug: false
  }))
);

if (isDevelopment) {
  router.get(
    '/graphiql',
    graphiqlKoa({
      endpointURL,
      subscriptionsEndpoint: `ws://localhost:8081/${subscriptionsEndpoint}`
    })
  );
}

app.use(router.routes()).use(router.allowedMethods());

export default app;
