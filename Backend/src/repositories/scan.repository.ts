import crypto from 'crypto';
import Database from '../config/db';
import { ScanRecord, ScanStatus, ScanOptions, ScanPageRecord, EvaluationRecord, FindingRecord, EvidenceRecord } from '../types';

export class ScanRepository {
  // In-memory persistent stores when DB is unavailable
  private static scans = new Map<string, ScanRecord>();
  private static pages = new Map<string, ScanPageRecord[]>();
  private static evaluations = new Map<string, EvaluationRecord[]>();
  private static findings = new Map<string, FindingRecord[]>();
  private static evidence = new Map<string, EvidenceRecord[]>();

  public static async create(data: {
    targetUrl: string;
    normalizedUrl: string;
    options: ScanOptions;
  }): Promise<ScanRecord> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const record: ScanRecord = {
      id,
      targetUrl: data.targetUrl,
      normalizedUrl: data.normalizedUrl,
      status: 'queued',
      options: data.options,
      overallScore: null,
      createdAt: now,
      updatedAt: now,
    };

    if (Database.isConnected) {
      try {
        const query = `
          INSERT INTO scans (id, target_url, normalized_url, status, options, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *;
        `;
        await Database.query(query, [
          record.id,
          record.targetUrl,
          record.normalizedUrl,
          record.status,
          JSON.stringify(record.options),
          record.createdAt,
          record.updatedAt,
        ]);
      } catch (err: any) {
        console.warn('[DB Error - ScanRepository.create]:', err.message);
      }
    }

    this.scans.set(id, record);
    return record;
  }

  public static async findById(id: string): Promise<ScanRecord | null> {
    if (Database.isConnected) {
      try {
        const rows = await Database.query<any>('SELECT * FROM scans WHERE id = $1', [id]);
        if (rows.length > 0) {
          const row = rows[0];
          return {
            id: row.id,
            targetUrl: row.target_url,
            normalizedUrl: row.normalized_url,
            status: row.status as ScanStatus,
            options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
            overallScore: row.overall_score ? parseFloat(row.overall_score) : null,
            errorCode: row.error_code,
            errorMessage: row.error_message,
            createdAt: row.created_at,
            startedAt: row.started_at,
            completedAt: row.completed_at,
            updatedAt: row.updated_at,
          };
        }
      } catch (err: any) {
        console.warn('[DB Error - ScanRepository.findById]:', err.message);
      }
    }
    return this.scans.get(id) || null;
  }

  public static async updateStatus(
    id: string,
    status: ScanStatus,
    data?: {
      startedAt?: string;
      completedAt?: string;
      overallScore?: number;
      errorCode?: string;
      errorMessage?: string;
    }
  ): Promise<void> {
    const now = new Date().toISOString();
    const scan = this.scans.get(id);
    if (scan) {
      scan.status = status;
      scan.updatedAt = now;
      if (data?.startedAt) scan.startedAt = data.startedAt;
      if (data?.completedAt) scan.completedAt = data.completedAt;
      if (data?.overallScore !== undefined) scan.overallScore = data.overallScore;
      if (data?.errorCode) scan.errorCode = data.errorCode;
      if (data?.errorMessage) scan.errorMessage = data.errorMessage;
      this.scans.set(id, scan);
    }

    if (Database.isConnected) {
      try {
        const query = `
          UPDATE scans
          SET status = $2,
              started_at = COALESCE($3, started_at),
              completed_at = COALESCE($4, completed_at),
              overall_score = COALESCE($5, overall_score),
              error_code = COALESCE($6, error_code),
              error_message = COALESCE($7, error_message),
              updated_at = $8
          WHERE id = $1;
        `;
        await Database.query(query, [
          id,
          status,
          data?.startedAt || null,
          data?.completedAt || null,
          data?.overallScore || null,
          data?.errorCode || null,
          data?.errorMessage || null,
          now,
        ]);
      } catch (err: any) {
        console.warn('[DB Error - ScanRepository.updateStatus]:', err.message);
      }
    }
  }

  public static async list(limit = 20, offset = 0, status?: string): Promise<{ items: ScanRecord[]; total: number }> {
    if (Database.isConnected) {
      try {
        let countQuery = 'SELECT COUNT(*) FROM scans';
        let dataQuery = 'SELECT * FROM scans ORDER BY created_at DESC LIMIT $1 OFFSET $2';
        const params: any[] = [limit, offset];

        if (status) {
          countQuery += ' WHERE status = $1';
          dataQuery = 'SELECT * FROM scans WHERE status = $3 ORDER BY created_at DESC LIMIT $1 OFFSET $2';
          params.push(status);
        }

        const countRes = await Database.query<{ count: string }>(countQuery, status ? [status] : []);
        const total = parseInt(countRes[0]?.count || '0', 10);
        const rows = await Database.query<any>(dataQuery, params);

        const items: ScanRecord[] = rows.map((r) => ({
          id: r.id,
          targetUrl: r.target_url,
          normalizedUrl: r.normalized_url,
          status: r.status,
          options: typeof r.options === 'string' ? JSON.parse(r.options) : r.options,
          overallScore: r.overall_score ? parseFloat(r.overall_score) : null,
          createdAt: r.created_at,
          startedAt: r.started_at,
          completedAt: r.completed_at,
          updatedAt: r.updated_at,
        }));

        return { items, total };
      } catch (err: any) {
        console.warn('[DB Error - ScanRepository.list]:', err.message);
      }
    }

    let all = Array.from(this.scans.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (status) {
      all = all.filter((s) => s.status === status);
    }
    return {
      items: all.slice(offset, offset + limit),
      total: all.length,
    };
  }

  public static async saveResults(
    scanId: string,
    results: {
      pages?: ScanPageRecord[];
      evaluations: EvaluationRecord[];
      findings: FindingRecord[];
      evidence: EvidenceRecord[];
      overallScore: number;
    }
  ): Promise<void> {
    if (results.pages) this.pages.set(scanId, results.pages);
    this.evaluations.set(scanId, results.evaluations);
    this.findings.set(scanId, results.findings);
    this.evidence.set(scanId, results.evidence);

    await this.updateStatus(scanId, 'completed', {
      completedAt: new Date().toISOString(),
      overallScore: results.overallScore,
    });
  }

  public static async getResults(scanId: string) {
    return {
      scan: await this.findById(scanId),
      pages: this.pages.get(scanId) || [],
      evaluations: this.evaluations.get(scanId) || [],
      findings: this.findings.get(scanId) || [],
      evidence: this.evidence.get(scanId) || [],
    };
  }

  public static async getEvidence(scanId: string): Promise<EvidenceRecord[]> {
    return this.evidence.get(scanId) || [];
  }
}
