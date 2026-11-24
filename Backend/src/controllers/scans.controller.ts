import { Request, Response, NextFunction } from 'express';
import { ScanService } from '../services/scan.service';
import { ReportService } from '../services/report.service';
import { EvidenceService } from '../services/evidence.service';
import { ScanRepository } from '../repositories/scan.repository';
import { config } from '../config/env';

export class ScansController {
  public static async createScan(req: Request, res: Response, next: NextFunction) {
    try {
      const { url, options } = req.body;
      const result = await ScanService.createScan({ url, options });

      return res.status(202).json({
        success: true,
        data: {
          scanId: result.scan.id,
          status: result.scan.status,
          targetUrl: result.scan.targetUrl,
          createdAt: result.scan.createdAt,
        },
        message: 'Scan submitted and queued for browser inspection.',
      });
    } catch (err) {
      next(err);
    }
  }

  public static async listScans(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);
      const status = req.query.status as string;

      const result = await ScanService.listScans(page, limit, status);
      return res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getScan(req: Request, res: Response, next: NextFunction) {
    try {
      const { scanId } = req.params;
      const scan = await ScanService.getScan(scanId);
      return res.json({
        success: true,
        data: scan,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getScanStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { scanId } = req.params;
      const status = await ScanService.getStatus(scanId);
      return res.json({
        success: true,
        data: status,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getScanResults(req: Request, res: Response, next: NextFunction) {
    try {
      const { scanId } = req.params;
      const report = await ReportService.getScanReport(scanId);
      return res.json({
        success: true,
        data: report,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getScanEvidence(req: Request, res: Response, next: NextFunction) {
    try {
      const { scanId } = req.params;
      const evidence = await ScanRepository.getEvidence(scanId);
      return res.json({
        success: true,
        data: evidence,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getEvidenceUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { scanId, evidenceId } = req.params;
      const url = await EvidenceService.getEvidenceAccessUrl(scanId, evidenceId);
      if (!url) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'EVIDENCE_NOT_FOUND',
            message: 'Evidence item not found or does not belong to this scan.',
          },
        });
      }

      return res.json({
        success: true,
        data: { url },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Internal endpoint called by worker to update status or report completed results.
   */
  public static async workerCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const secret = req.headers['x-worker-secret'];
      if (secret !== config.worker.callbackSecret) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid worker secret.' } });
      }

      const { scanId, status, stage, results, error } = req.body;
      if (!scanId) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'scanId is required.' } });
      }

      if (stage) {
        await ScanRepository.updateStatus(scanId, stage);
      }

      if (status === 'completed' && results) {
        await ScanRepository.saveResults(scanId, results);
      } else if (status === 'failed') {
        await ScanRepository.updateStatus(scanId, 'failed', {
          errorCode: error?.code || 'WORKER_ERROR',
          errorMessage: error?.message || 'Worker execution failed.',
          completedAt: new Date().toISOString(),
        });
      }

      return res.json({ success: true, message: 'Callback processed successfully.' });
    } catch (err) {
      next(err);
    }
  }
}
