import express from 'express';
import cors from 'cors';
import scanRoutes from './routes/scans.routes';
import { errorHandler } from './middleware/error.middleware';

export function createApp() {
  const app = express();

  // Security & standard middleware
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Worker-Secret'],
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Root redirect to /api
  app.get('/', (req, res) => {
    res.redirect('/api');
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'flowlens-backend',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API routes
  app.use('/api', scanRoutes);

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
}
