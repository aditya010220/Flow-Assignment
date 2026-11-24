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

export interface ScanRecord {
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
  updatedAt: string;
}

export interface ScanPageRecord {
  id: string;
  scanId: string;
  url: string;
  title?: string | null;
  pageStatus?: number | null;
  depth: number;
  visitOrder: number;
  loadTimeMs?: number | null;
  consoleErrors: Array<{ type: string; message: string; timestamp?: string }>;
  createdAt: string;
}

export interface EvaluationRecord {
  id: string;
  scanId: string;
  categoryKey: string;
  categoryName: string;
  score: number | null;
  scoreScale: string;
  status: 'passed' | 'needs_attention' | 'failed';
  summary: string;
  rubricVersion: string;
  details: Record<string, any>;
  createdAt: string;
}

export interface FindingRecord {
  id: string;
  scanId: string;
  evaluationId?: string | null;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation?: string | null;
  confidence: number;
  evidenceIds?: string[];
  createdAt: string;
}

export interface EvidenceRecord {
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

export interface ScanProgress {
  stage: ScanStatus;
  currentStep?: number;
  totalSteps?: number;
  message?: string;
  updatedAt: string;
}

export interface WorkerJobPayload {
  scanId: string;
  targetUrl: string;
  options: ScanOptions;
  callbackUrl: string;
  secret: string;
}

export interface WorkerProgressUpdate {
  scanId: string;
  stage: ScanStatus;
  currentStep?: number;
  totalSteps?: number;
  message?: string;
}

export interface WorkerResultPayload {
  scanId: string;
  status: 'completed' | 'failed';
  errorCode?: string;
  errorMessage?: string;
  overallScore?: number;
  pages: ScanPageRecord[];
  categories: EvaluationRecord[];
  findings: FindingRecord[];
  evidence: EvidenceRecord[];
}
