import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'FlowLens — UI/UX Flow Analyzer',
  description: 'Evidence-backed website UX and interaction flow audit system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-screen bg-white text-black flex flex-col antialiased selection:bg-black selection:text-white">
        <Navigation />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-black/10 py-6 text-center text-xs text-black/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>FlowLens UI/UX Flow Analyzer — Automated Evidence Capture & Rubric Scoring</span>
            <div className="flex gap-4">
              <a href="/how-scores-work" className="hover:text-black underline underline-offset-2">
                How Scores Work
              </a>
              <a href="/history" className="hover:text-black underline underline-offset-2">
                Scan History
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
