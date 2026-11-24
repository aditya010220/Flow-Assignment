'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api';
import { ScanReport, EvidenceItem, DevicePreset } from '@/types';

export default function FlowViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>('desktop');
  const [selectedFrame, setSelectedFrame] = useState<EvidenceItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  useEffect(() => {
    ApiClient.getScanResults(id)
      .then((data) => {
        setReport(data);
        if (data.evidence.length > 0) {
          setSelectedFrame(data.evidence[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Slideshow playback effect
  useEffect(() => {
    if (!isPlaying || !report || report.evidence.length === 0) return;

    const timer = setInterval(() => {
      setCurrentFrameIndex((prev) => {
        const next = (prev + 1) % report.evidence.length;
        setSelectedFrame(report.evidence[next]);
        return next;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [isPlaying, report]);

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!report || report.evidence.length === 0) return;
      if (e.key === 'ArrowRight') {
        setCurrentFrameIndex((prev) => {
          const next = (prev + 1) % report.evidence.length;
          setSelectedFrame(report.evidence[next]);
          return next;
        });
      } else if (e.key === 'ArrowLeft') {
        setCurrentFrameIndex((prev) => {
          const next = (prev - 1 + report.evidence.length) % report.evidence.length;
          setSelectedFrame(report.evidence[next]);
          return next;
        });
      } else if (e.key === 'Escape') {
        setIsPlaying(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [report]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <span className="material-symbols-outlined text-4xl animate-spin text-black" aria-hidden="true">
          progress_activity
        </span>
        <p className="text-sm text-black/60">Loading interaction flow...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="py-20 text-center space-y-4">
        <h1 className="text-xl font-bold">Flow Not Found</h1>
        <Link href="/" className="inline-block px-4 py-2 bg-black text-white text-xs font-semibold rounded">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const frames = report.evidence.filter((e) => e.evidenceType === 'screenshot');
  const sections = Array.from(new Set(frames.map((f) => f.metadata?.sectionName).filter(Boolean)));

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="border-b border-black/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/scans/${id}`} className="text-xs text-black/60 hover:text-black hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_back</span>
              <span>Back to Audit Report</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-black flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">
              view_timeline
            </span>
            <span>Flow Viewer & Scroll Walkthrough</span>
          </h1>
          <p className="text-xs text-black/60 font-mono mt-0.5">{report.targetUrl}</p>
        </div>

        {/* Device Switcher & Playback Mode */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center border border-black/20 rounded p-0.5 bg-black/5">
            {(['desktop', 'tablet', 'mobile'] as DevicePreset[]).map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDevice(d)}
                className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded transition ${
                  selectedDevice === d ? 'bg-black text-white' : 'text-black/70 hover:text-black'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-black text-white text-xs font-semibold rounded hover:bg-black/85 transition"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
            <span>{isPlaying ? 'Pause Slideshow' : 'Play Walkthrough'}</span>
          </button>
        </div>
      </div>

      {/* Main Inspection View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Frame Zoom Preview */}
        <div className="lg:col-span-3 border border-black/15 rounded-lg p-4 bg-white space-y-4">
          <div className="flex items-center justify-between text-xs text-black/60 pb-2 border-b border-black/10">
            <span className="font-semibold text-black">
              {selectedFrame?.metadata?.sectionName || 'Checkpoint Frame'} (
              {selectedFrame?.metadata?.scrollPercent ?? 0}% scrolled)
            </span>
            <span className="font-mono">Use &larr; &rarr; arrow keys to step</span>
          </div>

          <div className="w-full bg-black/5 border border-black/10 rounded min-h-[440px] flex items-center justify-center p-4 overflow-hidden">
            {selectedFrame ? (
              <div className="text-center space-y-3">
                <div className="border border-black/30 rounded p-8 bg-white shadow-sm inline-block max-w-xl text-left">
                  <div className="flex items-center justify-between border-b border-black/10 pb-2 mb-3 text-xs">
                    <span className="font-bold text-black uppercase tracking-wider">
                      {selectedFrame.metadata?.sectionName || 'Screen Capture'}
                    </span>
                    <span className="font-mono text-black/50">{selectedFrame.metadata?.scrollPositionPx || 0}px</span>
                  </div>
                  <p className="text-sm text-black/80">{selectedFrame.description || 'Human-like scroll step checkpoint'}</p>
                  <div className="mt-4 pt-3 border-t border-black/10 flex justify-between text-[11px] text-black/60 font-mono">
                    <span>Animations Detected: {selectedFrame.metadata?.animatedCount ?? 0}</span>
                    <span>Device: {selectedDevice}</span>
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-sm text-black/40">Select a frame from the filmstrip below</span>
            )}
          </div>
        </div>

        {/* Section Map Sidebar */}
        <div className="lg:col-span-1 border border-black/15 rounded-lg p-4 bg-white space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              map
            </span>
            <span>Section Map</span>
          </h3>
          <div className="space-y-2">
            {sections.length === 0 ? (
              <p className="text-xs text-black/50">Standard single-section page</p>
            ) : (
              sections.map((sec, i) => (
                <div
                  key={i}
                  className="p-2.5 border border-black/15 rounded text-xs flex items-center justify-between hover:border-black cursor-pointer transition"
                  onClick={() => {
                    const match = frames.find((f) => f.metadata?.sectionName === sec);
                    if (match) setSelectedFrame(match);
                  }}
                >
                  <span className="font-semibold text-black">{sec}</span>
                  <span className="material-symbols-outlined text-sm text-black/50" aria-hidden="true">
                    arrow_forward
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Filmstrip Timeline */}
      <section className="border border-black/15 rounded-lg p-5 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-black flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              movie
            </span>
            <span>Filmstrip Timeline ({frames.length} checkpoints)</span>
          </h3>
          <span className="text-xs text-black/50 font-mono">
            Step {currentFrameIndex + 1} of {frames.length}
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-3 pt-1">
          {frames.map((frame, index) => {
            const isSelected = selectedFrame?.id === frame.id;
            return (
              <button
                key={frame.id || index}
                onClick={() => {
                  setSelectedFrame(frame);
                  setCurrentFrameIndex(index);
                }}
                className={`flex-shrink-0 w-36 p-2 text-left border rounded transition ${
                  isSelected ? 'border-black bg-black text-white shadow' : 'border-black/20 bg-white hover:border-black/50'
                }`}
              >
                <div className={`h-20 border rounded mb-2 flex items-center justify-center text-xs font-mono ${
                  isSelected ? 'border-white/30 bg-black/40 text-white' : 'border-black/10 bg-black/5 text-black/60'
                }`}>
                  {frame.metadata?.scrollPercent ?? 0}%
                </div>
                <div className="text-[11px] font-bold truncate">
                  {frame.metadata?.sectionName || `Frame #${index + 1}`}
                </div>
                <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/70' : 'text-black/50'}`}>
                  {frame.metadata?.animatedCount ?? 0} anims
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
