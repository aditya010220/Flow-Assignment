import { ScanRepository } from '../repositories/scan.repository';
import { EvaluationService } from './evaluation.service';
import R2Storage from '../config/r2';

export class ReportService {
  public static async getScanReport(scanId: string) {
    const data = await ScanRepository.getResults(scanId);
    if (!data.scan) {
      throw {
        statusCode: 404,
        code: 'SCAN_NOT_FOUND',
        message: `Scan with id "${scanId}" was not found.`,
      };
    }

    const topIssues = EvaluationService.rankTopIssues(data.findings, 10);

    // Generate signed URLs for all evidence
    const evidenceWithUrls = await Promise.all(
      data.evidence.map(async (item) => {
        const signedUrl = await R2Storage.getSignedDownloadUrl(item.objectKey, 3600);
        return {
          ...item,
          url: signedUrl,
        };
      })
    );

    return {
      scanId: data.scan.id,
      targetUrl: data.scan.targetUrl,
      status: data.scan.status,
      overallScore: data.scan.overallScore,
      scoreScale: '0-100',
      summary: {
        overallScore: data.scan.overallScore,
        totalIssues: data.findings.length,
        criticalIssues: data.findings.filter((f) => f.severity === 'critical').length,
        highIssues: data.findings.filter((f) => f.severity === 'high').length,
        pagesScanned: data.pages.length,
        scannedAt: data.scan.createdAt,
      },
      categories: data.evaluations.map((evalItem) => {
        const catFindings = data.findings.filter((f) => f.evaluationId === evalItem.id);
        return {
          id: evalItem.id,
          key: evalItem.categoryKey,
          name: evalItem.categoryName,
          score: evalItem.score,
          status: evalItem.status,
          summary: evalItem.summary,
          rubricVersion: evalItem.rubricVersion,
          details: evalItem.details,
          findings: catFindings,
        };
      }),
      topIssues,
      pages: data.pages,
      evidence: evidenceWithUrls,
      startedAt: data.scan.startedAt,
      completedAt: data.scan.completedAt,
    };
  }
}
