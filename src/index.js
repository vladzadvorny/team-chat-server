import app from './app';
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
  await app.listen(port);
  console.log(`Server started on port ${port}`);
})();
