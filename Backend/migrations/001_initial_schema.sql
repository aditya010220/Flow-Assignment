-- FlowLens Initial PostgreSQL Migration
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_url TEXT NOT NULL,
  normalized_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('queued', 'loading', 'scrolling', 'capturing', 'evaluating', 'completed', 'failed', 'cancelled')
  ),
  options JSONB NOT NULL DEFAULT '{}'::jsonb,
  overall_score NUMERIC(5,2),
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS scans_created_at_idx ON scans (created_at DESC);
CREATE INDEX IF NOT EXISTS scans_status_created_at_idx ON scans (status, created_at DESC);

CREATE TABLE IF NOT EXISTS scan_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  page_status INTEGER,
  depth INTEGER NOT NULL DEFAULT 0,
  visit_order INTEGER NOT NULL,
  load_time_ms INTEGER,
  console_errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (scan_id, visit_order)
);

CREATE INDEX IF NOT EXISTS scan_pages_scan_id_idx ON scan_pages (scan_id);

CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  category_key TEXT NOT NULL,
  category_name TEXT NOT NULL,
  score NUMERIC(5,2),
  score_scale TEXT,
  status TEXT NOT NULL,
  summary TEXT NOT NULL,
  rubric_version TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (scan_id, category_key)
);

CREATE INDEX IF NOT EXISTS evaluations_scan_id_idx ON evaluations (scan_id);

CREATE TABLE IF NOT EXISTS findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  evaluation_id UUID REFERENCES evaluations(id) ON DELETE SET NULL,
  severity TEXT NOT NULL CHECK (
    severity IN ('info', 'low', 'medium', 'high', 'critical')
  ),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,
  confidence NUMERIC(4,3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS findings_scan_id_idx ON findings (scan_id);

CREATE TABLE IF NOT EXISTS scan_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  page_id UUID REFERENCES scan_pages(id) ON DELETE SET NULL,
  finding_id UUID REFERENCES findings(id) ON DELETE SET NULL,
  evidence_type TEXT NOT NULL CHECK (
    evidence_type IN ('screenshot', 'video', 'trace', 'log', 'other')
  ),
  object_key TEXT NOT NULL,
  content_type TEXT NOT NULL,
  byte_size BIGINT,
  page_url TEXT,
  description TEXT,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS scan_evidence_scan_id_idx ON scan_evidence (scan_id);
CREATE INDEX IF NOT EXISTS scan_evidence_page_id_idx ON scan_evidence (page_id);
CREATE INDEX IF NOT EXISTS scan_evidence_finding_id_idx ON scan_evidence (finding_id);

CREATE TABLE IF NOT EXISTS scan_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS scan_events_scan_id_created_at_idx ON scan_events (scan_id, created_at);
