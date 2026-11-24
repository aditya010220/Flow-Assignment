import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;
const WORKER_SECRET = process.env.WORKER_SECRET || 'flowlens-internal-worker-secret';

app.get('/health', (req, res) => {
  res.json({ status: 'ok', worker: 'playwright-chromium', ready: true });
});

// Worker Job Dispatch Receiver
app.post('/api/jobs', async (req, res) => {
  const secret = req.headers['x-worker-secret'];
  if (secret !== WORKER_SECRET) {
    return res.status(401).json({ error: 'Unauthorized worker invocation' });
  }

  const { scanId, targetUrl, options, callbackUrl } = req.body;
  console.info(`[Worker] Received job for scan ${scanId} -> ${targetUrl}`);

  // Return immediate acknowledgement
  res.status(202).json({ success: true, message: 'Job accepted by Chromium worker' });

  // Browser execution lifecycle will proceed asynchronously and report back to callbackUrl
});

app.listen(PORT, () => {
  console.info(`[FlowLens Worker] Listening on port ${PORT}`);
});
