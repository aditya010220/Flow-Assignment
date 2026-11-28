'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api';
import { ScanItem } from '@/types';

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    ApiClient.listScans(1, 50)
      .then((res) => setScans(res.items))
      .finally(() => setLoading(false));
  }, []);

  const filtered = scans.filter((s) => {
    const matchesSearch = s.targetUrl.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-black/10 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Scan Audit History</h1>
          <p className="text-sm text-black/60 mt-0.5">Review, search, and export past website audits.</p>
        </div>
        <Link
          href="/scans/new"
          className="px-4 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-black/85 transition"
        >
          New Audit
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-black/40 text-lg" aria-hidden="true">
            search
          </span>
          <input
            type="text"
            placeholder="Search by URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-black/20 rounded text-xs text-black placeholder:text-black/40 focus:outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-1.5 border border-black/20 rounded p-1 bg-white">
          {['all', 'completed', 'failed', 'running'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded transition ${
                statusFilter === st ? 'bg-black text-white' : 'text-black/60 hover:text-black'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Scans List Table */}
      <div className="border border-black/15 rounded-lg overflow-hidden bg-white">
        {loading ? (
          <div className="py-12 text-center text-sm text-black/50">Loading history...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-black/50">No scans matching the criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/5 text-black/60 text-xs uppercase tracking-wider border-b border-black/10">
                <tr>
                  <th className="px-6 py-3">Website</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Score</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-black/[0.02] transition">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-black max-w-sm truncate">
                      {s.targetUrl}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border border-black/30">
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold">
                      {s.overallScore !== null ? `${s.overallScore} / 100` : '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-black/60" suppressHydrationWarning>
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/scans/${s.id}`}
                          className="px-3 py-1 bg-black text-white text-xs font-medium rounded hover:bg-black/85 transition"
                        >
                          Report
                        </Link>
                        <Link
                          href={`/scans/${s.id}/flow`}
                          className="px-2.5 py-1 border border-black/20 text-black text-xs font-medium rounded hover:border-black transition"
                        >
                          Flow
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
