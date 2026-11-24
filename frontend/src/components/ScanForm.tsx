'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api';
import { DevicePreset } from '@/types';

export default function ScanForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [devices, setDevices] = useState<DevicePreset[]>(['desktop', 'mobile']);
  const [recordVideo, setRecordVideo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDevice = (d: DevicePreset) => {
    if (devices.includes(d)) {
      if (devices.length === 1) return; // Keep at least one
      setDevices(devices.filter((item) => item !== d));
    } else {
      setDevices([...devices, d]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    let cleanUrl = url.trim();
    if (!cleanUrl) {
      setError('Please enter a target website URL.');
      return;
    }
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    try {
      new URL(cleanUrl);
    } catch {
      setError('Invalid URL syntax. Please enter a valid website address.');
      return;
    }

    setLoading(true);

    try {
      const res = await ApiClient.createScan(cleanUrl, {
        devices,
        recordVideo,
        captureScreenshots: true,
      });

      router.push(`/scans/${res.scanId}/progress`);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize scan.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-black/15 rounded-lg p-6 bg-white space-y-6">
      <div>
        <label htmlFor="url" className="block text-sm font-semibold text-black mb-1.5">
          Website Target URL
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-3 text-black/50 text-xl" aria-hidden="true">
            link
          </span>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            disabled={loading}
            className="w-full pl-10 pr-4 py-2.5 border border-black/20 rounded text-sm text-black placeholder:text-black/40 focus:outline-none focus:border-black transition"
          />
        </div>
        <p className="text-xs text-black/60 mt-1.5">
          Accepts public HTTP or HTTPS web links. Private IP subnets and localhost are blocked by SSRF guards.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-black mb-2">Device Viewports</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'desktop' as DevicePreset, label: 'Desktop', size: '1440 × 900 px', icon: 'desktop_windows' },
            { id: 'tablet' as DevicePreset, label: 'Tablet', size: '768 × 1024 px', icon: 'tablet_mac' },
            { id: 'mobile' as DevicePreset, label: 'Mobile', size: '390 × 844 px', icon: 'phone_iphone' },
          ].map((item) => {
            const isSelected = devices.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleDevice(item.id)}
                className={`flex items-start gap-3 p-3 text-left border rounded transition ${
                  isSelected
                    ? 'border-black bg-black text-white'
                    : 'border-black/20 bg-white text-black hover:border-black/50'
                }`}
              >
                <span className="material-symbols-outlined text-xl mt-0.5" aria-hidden="true">
                  {item.icon}
                </span>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">{item.label}</div>
                  <div className={`text-[11px] ${isSelected ? 'text-white/70' : 'text-black/60'}`}>{item.size}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <label className="flex items-center gap-2 text-sm text-black cursor-pointer">
          <input
            type="checkbox"
            checked={recordVideo}
            onChange={(e) => setRecordVideo(e.target.checked)}
            className="w-4 h-4 rounded border-black/30 accent-black text-black"
          />
          <span className="font-medium">Record full scroll video walkthrough (.webm)</span>
        </label>
      </div>

      {error && (
        <div className="p-3 border border-black rounded text-xs bg-black/5 text-black flex items-center gap-2">
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            error
          </span>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto px-6 py-2.5 bg-black text-white font-medium rounded text-sm hover:bg-black/85 disabled:opacity-50 transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="material-symbols-outlined animate-spin text-[18px]" aria-hidden="true">
              progress_activity
            </span>
            <span>Initializing Scan...</span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              play_arrow
            </span>
            <span>Start FlowLens Scan</span>
          </>
        )}
      </button>
    </form>
  );
}
