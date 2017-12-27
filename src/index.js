import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import jwt from 'jsonwebtoken';

import app, { schema } from './app';
import models from './models';
import { port, subscriptionsEndpoint, jwtSecret1, jwtSecret2 } from './config';
import { refreshTokens } from './auth';

(async () => {
  try {
    const { config } = await models.sequelize.sync({
      // force: true
    });
    console.log(
      `Connected to ${config.host}:${config.port}, database: ${config.database}`
    );
  } catch (error) {
    console.error('Unable to connect to database');
    process.exit(1);
  }

  const server = createServer(app.callback());

  server.listen(port, () => {
    // eslint-disable-next-line no-new
    new SubscriptionServer(
      {
        execute,
        subscribe,
        schema,
        onConnect: async ({ token, refreshToken }, webSocket) => {
          if (token && refreshToken) {
            try {
              const { user } = jwt.verify(token, jwtSecret1);
              return { models, user };
            } catch (err) {
              const newTokens = await refreshTokens(
                token,
                refreshToken,
                models,
                jwtSecret1,
                jwtSecret2
              );
              return { models, user: newTokens.user };
            }
          }

          return { models };
        }
      },
      {
        server,
        path: subscriptionsEndpoint
      }
    );
    console.log(`Server started on port ${port}`);
  });
})();
