import R2Storage from '../config/r2';
import { EvidenceRecord } from '../types';
import { ScanRepository } from '../repositories/scan.repository';

export class EvidenceService {
  /**
   * Generates a secure, short-lived signed URL for an evidence item.
   * Verifies that the evidence belongs to the specified scan.
   */
  public static async getEvidenceAccessUrl(scanId: string, evidenceId: string): Promise<string | null> {
    const evidenceList = await ScanRepository.getEvidence(scanId);
    const item = evidenceList.find((e) => e.id === evidenceId);

    if (!item) {
      return null;
    }

    return await R2Storage.getSignedDownloadUrl(item.objectKey, 3600);
  }
}
