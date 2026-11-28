import Link from 'next/link';
import ScanForm from '@/components/ScanForm';
import { ApiClient } from '@/lib/api';

export default async function DashboardPage() {
  const { items: recentScans } = await ApiClient.listScans(1, 5);

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="border-b border-black/10 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Website UI/UX & Flow Analyzer</h1>
          <p className="text-sm text-black/60 mt-1 max-w-2xl">
            FlowLens captures human-like scroll sessions, records scroll-triggered animations (GSAP, AOS, Framer Motion),
            measures performance, accessibility, responsiveness, and produces an evidence-backed audit report.
          </p>
        </div>
        <Link
          href="/how-scores-work"
          className="text-xs font-semibold uppercase tracking-wider text-black border border-black/20 px-3 py-1.5 rounded hover:bg-black hover:text-white transition"
        >
          View 7-Category Rubric
        </Link>
      </div>

      {/* Primary Scan Setup Card */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-black flex items-center gap-2">
            <span className="material-symbols-outlined text-xl" aria-hidden="true">
              play_circle
            </span>
            <span>Initiate Website Scan</span>
          </h2>
          <span className="text-xs text-black/50 font-mono">Real-time Browser Inspection</span>
        </div>
        <ScanForm />
      </section>

      {/* Metrics Highlights */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Evaluation Engine', value: '7 Rubric Checks', note: 'axe-core, Lighthouse, styles, UX' },
          { label: 'Capture Fidelity', value: 'Human-like Scroll', note: '1/3 viewport steps with animation wait' },
          { label: 'Multi-Device Support', value: 'Desktop + Mobile', note: '1440×900, 768×1024, 390×844' },
          { label: 'Evidence Integrity', value: '100% Measured', note: 'No hardcoded or mocked evaluation scores' },
        ].map((m, i) => (
          <div key={i} className="border border-black/15 rounded-lg p-5 bg-white">
            <div className="text-xs font-bold uppercase tracking-wider text-black/50">{m.label}</div>
            <div className="text-xl font-bold text-black mt-1">{m.value}</div>
            <div className="text-xs text-black/60 mt-1">{m.note}</div>
          </div>
        ))}
      </section>

      {/* Recent Scans Table */}
      <section className="border border-black/15 rounded-lg overflow-hidden bg-white">
        <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between">
          <h2 className="text-base font-bold text-black flex items-center gap-2">
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              history
            </span>
            <span>Recent Audits</span>
          </h2>
          <Link href="/history" className="text-xs text-black font-semibold hover:underline">
            View All Scans &rarr;
          </Link>
        </div>

        {recentScans.length === 0 ? (
          <div className="p-8 text-center text-sm text-black/50">
            No scans recorded yet. Enter a URL above to run your first UI/UX flow analysis.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/5 text-black/60 text-xs uppercase tracking-wider border-b border-black/10">
                <tr>
                  <th className="px-6 py-3">Target Website</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Score</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {recentScans.map((s) => (
                  <tr key={s.id} className="hover:bg-black/[0.02] transition">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-black max-w-xs truncate">
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
      </section>
    </div>
  );
}
