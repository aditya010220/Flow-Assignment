import path from 'path';
import dotenv from 'dotenv';
import { S3Client, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testR2() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME || 'flowlens-storage';
  const endpoint = process.env.R2_ENDPOINT;

  console.info('Testing Cloudflare R2 connection...');
  console.info(`Bucket: ${bucketName}`);
  console.info(`Endpoint: ${endpoint}`);

  const client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
    },
  });

  try {
    const listRes = await client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        MaxKeys: 5,
      })
    );
    console.info('Cloudflare R2 connection successful! Found objects:', listRes.KeyCount ?? 0);

    // Test a tiny probe upload
    const probeKey = 'probes/connection-check.txt';
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: probeKey,
        Body: Buffer.from(`FlowLens probe at ${new Date().toISOString()}`),
        ContentType: 'text/plain',
      })
    );
    console.info(`Probe uploaded successfully to: ${probeKey}`);
  } catch (err: any) {
    console.error('R2 test failed:', err.message);
  }
}

testR2();
