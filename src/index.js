import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import app, { schema } from './app';
import models from './models';
import { port } from './config';

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
        schema
      },
      {
        server,
        path: '/subscriptions'
      }
    );
    console.log(`Server started on port ${port}`);
  });
})();
