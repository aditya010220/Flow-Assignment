'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api';
import { ScanStatus } from '@/types';
import Link from 'next/link';

const STAGES: { key: ScanStatus; label: string; icon: string; desc: string }[] = [
  { key: 'queued', label: 'Queued', icon: 'schedule', desc: 'Job received and awaiting worker allocation' },
  { key: 'loading', label: 'Loading', icon: 'download', desc: 'Opening Chromium, waiting for networkidle and fonts' },
  { key: 'scrolling', label: 'Scrolling', icon: 'swap_vert', desc: 'Human-like 1/3 viewport scroll with animation delay' },
  { key: 'capturing', label: 'Capturing', icon: 'photo_camera', desc: 'Saving checkpoint screenshots and video session' },
  { key: 'evaluating', label: 'Evaluating', icon: 'fact_check', desc: 'Running axe-core, Lighthouse, styles, and heuristics' },
  { key: 'completed', label: 'Complete', icon: 'check_circle', desc: 'Audit generated and evidence persisted to storage' },
];

export default function ScanProgressPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [status, setStatus] = useState<ScanStatus>('queued');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const poll = async () => {
      try {
        const res = await ApiClient.getScanStatus(id);
        setStatus(res.status);

        if (res.status === 'completed') {
          clearInterval(interval);
          setTimeout(() => {
            router.push(`/scans/${id}`);
          }, 1200);
        } else if (res.status === 'failed') {
          clearInterval(interval);
          setErrorMsg('The website scan timed out or could not be completed.');
        }
      } catch (err: any) {
        console.warn('Poll error:', err.message);
      }
    };

    poll();
    interval = setInterval(poll, 2500);

    return () => clearInterval(interval);
  }, [id, router]);

  const currentIndex = STAGES.findIndex((s) => s.key === status);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-black">Audit in Progress</h1>
        <p className="text-sm text-black/60 font-mono">Scan ID: {id}</p>
      </div>

      <div className="border border-black/15 rounded-lg p-6 bg-white space-y-6">
        <div className="space-y-4">
          {STAGES.map((stage, idx) => {
            const isDone = idx < activeIndex || status === 'completed';
            const isCurrent = idx === activeIndex && status !== 'completed' && status !== 'failed';
            return (
              <div
                key={stage.key}
                className={`flex items-start gap-4 p-3 rounded border transition ${
                  isCurrent
                    ? 'border-black bg-black/5 font-semibold'
                    : isDone
                    ? 'border-black/20 bg-white opacity-80'
                    : 'border-black/10 opacity-35'
                }`}
              >
                <div className="mt-0.5">
                  {isCurrent ? (
                    <span className="material-symbols-outlined animate-spin text-black" aria-hidden="true">
                      progress_activity
                    </span>
                  ) : isDone ? (
                    <span className="material-symbols-outlined text-black" aria-hidden="true">
                      check_circle
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-black/40" aria-hidden="true">
                      radio_button_unchecked
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-black">{stage.label}</span>
                    <span className="text-[11px] uppercase tracking-wider text-black/50 font-mono">
                      Stage {idx + 1} of {STAGES.length}
                    </span>
                  </div>
                  <p className="text-xs text-black/60 mt-0.5">{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {errorMsg && (
          <div className="p-4 border border-black rounded bg-black/5 text-sm text-black space-y-3">
            <div className="font-bold flex items-center gap-2">
              <span className="material-symbols-outlined" aria-hidden="true">
                error
              </span>
              <span>Scan Interrupted</span>
            </div>
            <p className="text-xs text-black/70">{errorMsg}</p>
            <div className="pt-2">
              <Link
                href="/scans/new"
                className="inline-block px-4 py-1.5 bg-black text-white text-xs font-semibold rounded"
              >
                Try Another URL
              </Link>
            </div>
          </div>
        )}

        {status === 'completed' && (
          <div className="text-center pt-2">
            <Link
              href={`/scans/${id}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-semibold rounded hover:bg-black/85 transition"
            >
              <span>View Audit Report</span>
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                arrow_forward
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
