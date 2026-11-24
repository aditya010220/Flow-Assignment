import { UrlSafetyService } from './url-safety.service';
import { WorkerService } from './worker.service';
import { ScanRepository } from '../repositories/scan.repository';
import { ScanOptions, ScanRecord, ScanStatus } from '../types';

export class ScanService {
  public static async createScan(input: { url: string; options?: ScanOptions }): Promise<{ scan: ScanRecord }> {
    // 1. Validate URL against SSRF and syntax rules
    const safety = await UrlSafetyService.validateUrl(input.url);
    if (!safety.valid || !safety.normalizedUrl) {
      throw {
        statusCode: 400,
        code: 'INVALID_URL',
        message: safety.error || 'The submitted URL is not permitted or could not be resolved.',
      };
    }

    const options: ScanOptions = {
      maxPages: input.options?.maxPages || 5,
      devices: input.options?.devices || ['desktop', 'mobile'],
      captureScreenshots: input.options?.captureScreenshots !== false,
      recordVideo: input.options?.recordVideo !== false,
    };

    // 2. Persist initial queued scan
    const scan = await ScanRepository.create({
      targetUrl: input.url,
      normalizedUrl: safety.normalizedUrl,
      options,
    });

    // 3. Dispatch job to worker asynchronously
    setImmediate(async () => {
      try {
        await WorkerService.dispatchJob(scan.id, scan.normalizedUrl, options);
      } catch (err: any) {
        console.error(`[ScanService] Worker dispatch failed for ${scan.id}:`, err.message);
        await ScanRepository.updateStatus(scan.id, 'failed', {
          errorCode: 'WORKER_DISPATCH_FAILED',
          errorMessage: 'Unable to dispatch scan to worker container.',
        });
      }
    });

    return { scan };
  }

  public static async getScan(scanId: string): Promise<ScanRecord> {
    const scan = await ScanRepository.findById(scanId);
    if (!scan) {
      throw {
        statusCode: 404,
        code: 'SCAN_NOT_FOUND',
        message: `Scan with id "${scanId}" was not found.`,
      };
    }
    return scan;
  }

  public static async listScans(page = 1, limit = 20, status?: string) {
    const offset = (page - 1) * limit;
    const { items, total } = await ScanRepository.list(limit, offset, status);
    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public static async getStatus(scanId: string) {
    const scan = await this.getScan(scanId);
    return {
      scanId: scan.id,
      status: scan.status,
      overallScore: scan.overallScore,
      errorCode: scan.errorCode,
      errorMessage: scan.errorMessage,
      startedAt: scan.startedAt,
      completedAt: scan.completedAt,
      updatedAt: scan.updatedAt,
    };
  }
}
