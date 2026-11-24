import http from 'http';
import { config } from '../config/env';
import { ScanOptions, WorkerJobPayload } from '../types';
import { ScanRepository } from '../repositories/scan.repository';

export class WorkerService {
  /**
   * Dispatches a scan job to the Dockerized Playwright worker via HTTP.
   */
  public static async dispatchJob(scanId: string, targetUrl: string, options: ScanOptions): Promise<void> {
    const payload: WorkerJobPayload = {
      scanId,
      targetUrl,
      options,
      callbackUrl: `http://localhost:${config.port}/api/internal/worker/callback`,
      secret: config.worker.callbackSecret,
    };

    const workerUrl = new URL('/api/jobs', config.worker.internalUrl);

    // Update status to loading
    await ScanRepository.updateStatus(scanId, 'loading', {
      startedAt: new Date().toISOString(),
    });

    try {
      const data = JSON.stringify(payload);
      const req = http.request(
        workerUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
            'X-Worker-Secret': config.worker.callbackSecret,
          },
          timeout: 10000,
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            console.info(`[WorkerService] Successfully dispatched scan ${scanId} to worker at ${workerUrl.origin}`);
          } else {
            console.warn(`[WorkerService] Worker responded with status ${res.statusCode} for scan ${scanId}`);
          }
        }
      );

      req.on('error', (err) => {
        console.warn(
          `[WorkerService] Worker at ${config.worker.internalUrl} is not currently reachable (${err.message}). ` +
          `Scan is queued. Start the worker container using: docker compose up worker`
        );
      });

      req.write(data);
      req.end();
    } catch (err: any) {
      console.error(`[WorkerService] Dispatch exception for scan ${scanId}:`, err.message);
    }
  }
}
