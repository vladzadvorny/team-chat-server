import app from './app';
import { port } from './config';

(async () => {
  await app.listen(port);
  console.log(`Server started on port ${port}`);
})();
