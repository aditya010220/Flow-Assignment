export type ScanStatus =
  | 'queued'
  | 'loading'
  | 'scrolling'
  | 'capturing'
  | 'evaluating'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type DevicePreset = 'desktop' | 'tablet' | 'mobile';

export interface ScanOptions {
  maxPages?: number;
  devices?: DevicePreset[];
  captureScreenshots?: boolean;
  recordVideo?: boolean;
}

export interface ScanItem {
  id: string;
  targetUrl: string;
  normalizedUrl: string;
  status: ScanStatus;
  options: ScanOptions;
  overallScore: number | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface CategoryResult {
  id: string;
  key: string;
  name: string;
  score: number | null;
  status: 'passed' | 'needs_attention' | 'failed';
  summary: string;
  rubricVersion: string;
  details: Record<string, any>;
  findings: FindingItem[];
}

export interface FindingItem {
  id: string;
  evaluationId?: string | null;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation?: string | null;
  confidence: number;
  evidenceIds?: string[];
}

export interface EvidenceItem {
  id: string;
  scanId: string;
  pageId?: string | null;
  findingId?: string | null;
  evidenceType: 'screenshot' | 'video' | 'trace' | 'log' | 'other';
  objectKey: string;
  contentType: string;
  byteSize?: number | null;
  pageUrl?: string | null;
  description?: string | null;
  capturedAt: string;
  url?: string;
  metadata: {
    scrollPositionPx?: number;
    scrollPercent?: number;
    sectionName?: string;
    animatedCount?: number;
    device?: DevicePreset;
    boundingBox?: { x: number; y: number; width: number; height: number };
    [key: string]: any;
  };
}

export interface ScanReport {
  scanId: string;
  targetUrl: string;
  status: ScanStatus;
  overallScore: number | null;
  scoreScale: string;
  summary: {
    overallScore: number | null;
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
    pagesScanned: number;
    scannedAt: string;
  };
  categories: CategoryResult[];
  topIssues: FindingItem[];
  pages: any[];
  evidence: EvidenceItem[];
  startedAt?: string | null;
  completedAt?: string | null;
}
