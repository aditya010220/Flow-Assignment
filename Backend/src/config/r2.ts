import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from './env';

class R2Storage {
  private static client: S3Client | null = null;

  private static getClient(): S3Client | null {
    if (!this.client && config.r2.accountId && config.r2.accessKeyId) {
      const endpoint = config.r2.endpoint || `https://${config.r2.accountId}.r2.cloudflarestorage.com`;
      this.client = new S3Client({
        region: 'auto',
        endpoint,
        credentials: {
          accessKeyId: config.r2.accessKeyId,
          secretAccessKey: config.r2.secretAccessKey,
        },
      });
    }
    return this.client;
  }

  public static async uploadBuffer(
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<string> {
    const client = this.getClient();
    if (!client) {
      // In local dev without R2, we return the synthetic path
      return key;
    }

    const command = new PutObjectCommand({
      Bucket: config.r2.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await client.send(command);
    return key;
  }

  public static async getSignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const client = this.getClient();
    if (!client) {
      // If public base URL exists, use it, else return data URI placeholder or fallback
      if (config.r2.publicBaseUrl) {
        return `${config.r2.publicBaseUrl}/${key}`;
      }
      return `/api/evidence/fallback/${encodeURIComponent(key)}`;
    }

    const command = new GetObjectCommand({
      Bucket: config.r2.bucketName,
      Key: key,
    });

    return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  }
}

export default R2Storage;
