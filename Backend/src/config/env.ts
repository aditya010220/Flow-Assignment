import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  r2: {
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    bucketName: process.env.R2_BUCKET_NAME || 'flowlens-evidence',
    endpoint: process.env.R2_ENDPOINT || '',
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL || '',
  },
  worker: {
    internalUrl: process.env.WORKER_INTERNAL_URL || 'http://localhost:4000',
    callbackSecret: process.env.WORKER_CALLBACK_SECRET || 'flowlens-internal-worker-secret',
    maxPages: parseInt(process.env.SCAN_MAX_PAGES || '5', 10),
    timeoutMs: parseInt(process.env.SCAN_TIMEOUT_MS || '180000', 10),
  },
};
