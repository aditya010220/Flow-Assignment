import { createApp } from './app';
import { config } from './config/env';
import Database from './config/db';

async function bootstrap() {
  console.info('=========================================');
  console.info('      FlowLens Backend API Server        ');
  console.info('=========================================');

  // Test Database Connection
  await Database.testConnection();

  const app = createApp();

  app.listen(config.port, '0.0.0.0', () => {
    console.info(`[FlowLens API] Listening on port ${config.port} (${config.env}) on 0.0.0.0`);
    console.info(`[FlowLens API] Endpoints ready at http://localhost:${config.port}/api`);
  });
}

bootstrap().catch((err) => {
  console.error('[FlowLens API] Fatal bootstrap error:', err);
  process.exit(1);
});
