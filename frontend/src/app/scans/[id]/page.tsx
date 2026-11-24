'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api';
import { ScanReport } from '@/types';

export default function ScanReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    ApiClient.getScanResults(id)
      .then((data) => setReport(data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowlens-audit-${report.scanId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <span className="material-symbols-outlined text-4xl animate-spin text-black" aria-hidden="true">
          progress_activity
        </span>
        <p className="text-sm text-black/60">Loading audit report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="py-20 text-center space-y-4">
        <h1 className="text-xl font-bold">Report Not Found</h1>
        <p className="text-sm text-black/60">No scan record matches the requested identifier.</p>
        <Link href="/" className="inline-block px-4 py-2 bg-black text-white text-xs font-semibold rounded">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header & Quick Actions */}
      <div className="border-b border-black/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border border-black/30">
              {report.status}
            </span>
            <span className="text-xs text-black/50 font-mono">ID: {report.scanId}</span>
          </div>
          <h1 className="text-2xl font-bold text-black font-mono break-all">{report.targetUrl}</h1>
          <p className="text-xs text-black/60 mt-1">
            Scanned on {new Date(report.summary.scannedAt).toLocaleString()} • {report.summary.pagesScanned} pages evaluated
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/scans/${id}/flow`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-semibold rounded hover:bg-black/85 transition"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              view_timeline
            </span>
            <span>Open Flow Viewer</span>
          </Link>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-3 py-1.5 border border-black/20 text-black text-xs font-semibold rounded hover:border-black transition"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              share
            </span>
            <span>{copied ? 'Copied Link!' : 'Share'}</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1 px-3 py-1.5 border border-black/20 text-black text-xs font-semibold rounded hover:border-black transition"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              picture_as_pdf
            </span>
            <span>Export PDF</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1 px-3 py-1.5 border border-black/20 text-black text-xs font-semibold rounded hover:border-black transition"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              data_object
            </span>
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Overall Score Banner */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-black/15 rounded-lg p-6 bg-white">
        <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-black/10 pb-6 md:pb-0 md:pr-6 flex flex-col justify-center items-center text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-black/50 mb-1">Overall UI/UX Score</div>
          <div className="text-6xl font-black text-black tracking-tight">{report.overallScore ?? '—'}</div>
          <div className="text-xs text-black/60 mt-1">Scale: 0 – 100 (Weighted Rubric)</div>
          <Link href="/how-scores-work" className="text-xs underline text-black/70 mt-3 hover:text-black">
            How scores are computed &rarr;
          </Link>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="border border-black/10 rounded p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-black/50">Total Issues</div>
            <div className="text-2xl font-bold text-black mt-1">{report.summary.totalIssues}</div>
            <div className="text-xs text-black/60 mt-0.5">Evidence-backed findings</div>
          </div>
          <div className="border border-black/10 rounded p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-black/50">Critical Issues</div>
            <div className="text-2xl font-bold text-black mt-1">{report.summary.criticalIssues}</div>
            <div className="text-xs text-black/60 mt-0.5">WCAG / Breaking blocks</div>
          </div>
          <div className="border border-black/10 rounded p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-black/50">High Issues</div>
            <div className="text-2xl font-bold text-black mt-1">{report.summary.highIssues}</div>
            <div className="text-xs text-black/60 mt-0.5">Performance / Heuristics</div>
          </div>
        </div>
      </section>

      {/* Top 10 Issues Ranked by Severity x Impact */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-black flex items-center gap-2">
            <span className="material-symbols-outlined text-xl" aria-hidden="true">
              priority_high
            </span>
            <span>Top Issues (Ranked by Severity × Impact)</span>
          </h2>
          <span className="text-xs text-black/50 font-mono">Ranked Top 10</span>
        </div>

        {report.topIssues.length === 0 ? (
          <div className="p-6 border border-black/15 rounded-lg text-center text-sm text-black/60">
            No critical or high issues detected in the inspected pages.
          </div>
        ) : (
          <div className="space-y-3">
            {report.topIssues.map((issue, idx) => (
              <div key={issue.id || idx} className="border border-black/15 rounded-lg p-5 bg-white space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-black text-white rounded">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider border border-black/30 px-2 py-0.5 rounded">
                      {issue.severity}
                    </span>
                    <h3 className="text-base font-bold text-black">{issue.title}</h3>
                  </div>
                  <span className="text-xs font-mono text-black/50">Confidence: {Math.round(issue.confidence * 100)}%</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <span className="font-bold block text-black/60 uppercase text-[10px] tracking-wider">
                      Observation & Evidence
                    </span>
                    <p className="mt-1 text-black/80">{issue.description}</p>
                  </div>
                  <div>
                    <span className="font-bold block text-black/60 uppercase text-[10px] tracking-wider">
                      Recommendation & Fix
                    </span>
                    <p className="mt-1 text-black/80">{issue.recommendation || 'Remediate element to adhere to guidelines.'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* The 7 Assignment Categories */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-black flex items-center gap-2">
            <span className="material-symbols-outlined text-xl" aria-hidden="true">
              checklist
            </span>
            <span>The 7 Rubric Categories</span>
          </h2>
          <span className="text-xs text-black/50 font-mono">Standardized Rubric</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.categories.map((cat) => (
            <div key={cat.id || cat.key} className="border border-black/15 rounded-lg p-5 bg-white space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-black">{cat.name}</h3>
                  <div className="text-lg font-bold text-black">{cat.score !== null ? `${cat.score} / 100` : '—'}</div>
                </div>
                <p className="text-xs text-black/70 mt-2">{cat.summary}</p>
              </div>

              {cat.findings.length > 0 && (
                <div className="pt-2 border-t border-black/10">
                  <div className="text-[11px] font-bold text-black/60 uppercase tracking-wider mb-1.5">
                    Issues ({cat.findings.length})
                  </div>
                  <ul className="text-xs space-y-1">
                    {cat.findings.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-black/80">
                        <span className="text-black font-mono">•</span>
                        <span>{f.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
