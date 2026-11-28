import express from 'express';
import dotenv from 'dotenv';
import { chromium } from 'playwright';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'FlowLens Playwright Worker',
    status: 'running',
    health: '/health',
    jobEndpoint: 'POST /api/jobs'
  });
});

const PORT = process.env.PORT || 4000;
const WORKER_SECRET = process.env.WORKER_SECRET || 'flowlens-internal-worker-secret';

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    worker: 'playwright-chromium',
    ready: true
  });
});

app.post('/api/jobs', async (req, res) => {
  const secret = req.headers['x-worker-secret'];

  if (secret !== WORKER_SECRET) {
    return res.status(401).json({
      error: 'Unauthorized worker invocation'
    });
  }

  const { scanId, targetUrl, options, callbackUrl } = req.body;

  if (!scanId || !targetUrl) {
    return res.status(400).json({
      error: 'scanId and targetUrl are required'
    });
  }

  res.status(202).json({
    success: true,
    message: 'Job accepted by Chromium worker'
  });

  runScan(scanId, targetUrl, options).catch(error => {
    console.error(`[Worker] Scan ${scanId} failed:`, error);
  });
});

async function runScan(
  scanId: string,
  targetUrl: string,
  options: any
) {
  let browser;

  try {
    console.info(`[Worker] Starting scan: ${targetUrl}`);

    browser = await chromium.launch({
      headless: true
    });

    const page = await browser.newPage();

    await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    const title = await page.title();

    const screenshotPath = `/tmp/${scanId}.png`;

    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    console.info(`[Worker] Scan completed: ${title}`);
    console.info(`[Worker] Screenshot saved: ${screenshotPath}`);

    // Callback integration will be implemented next.
  } catch (error) {
    console.error(`[Worker] Scan failed:`, error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

app.listen(PORT, () => {
  console.info(`[FlowLens Worker] Listening on port ${PORT}`);
});
