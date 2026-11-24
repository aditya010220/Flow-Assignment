import Link from 'next/link';

export default function HowScoresWorkPage() {
  const categories = [
    {
      name: '1. Performance (Weight: 20%)',
      desc: 'Measured using Lighthouse programmatically or PageSpeed Insights. Assesses Core Web Vitals (LCP, CLS, TBT/INP, FCP), page transfer size, total request count, heaviest assets, and image sizing dimensions.',
      checks: [
        'Largest Contentful Paint (LCP < 2.5s)',
        'Cumulative Layout Shift (CLS < 0.1)',
        'Total Blocking Time (TBT < 200ms)',
        'Images served >2x rendered size detection',
        'Explicit width & height attributes on <img> tags',
      ],
    },
    {
      name: '2. Accessibility (Weight: 20%)',
      desc: 'Measured by injecting axe-core into the active page context. Violations are categorized by WCAG impact level and element selectors.',
      checks: [
        'WCAG 2.1 AA Color Contrast (minimum 4.5:1 for normal text)',
        'Image alternative text attributes (alt tags)',
        'Logical heading hierarchy order (h1 -> h2 -> h3)',
        'Form inputs paired with explicit <label> elements',
        'Mobile tap-target sizing (WCAG 2.2: at least 24×24 px)',
      ],
    },
    {
      name: '3. Responsiveness (Weight: 15%)',
      desc: 'Measured on Mobile viewport captures (390×844 px). Inspects horizontal overflow, viewport declarations, and typography readability.',
      checks: [
        'Horizontal scroll overflow detection (scrollWidth > innerWidth)',
        'Identification of specific elements causing layout breakout',
        'Body font size check (flags typography < 12 px)',
        'Viewport meta tag verification (<meta name="viewport">)',
      ],
    },
    {
      name: '4. Visual Consistency (Weight: 10%)',
      desc: 'Extracted from computed element styles across the DOM. Analyzes design token discipline, palette cohesion, and typographic scales.',
      checks: [
        'Font family count (flags excess > 3 families)',
        'Font size variance (flags excess > 12 distinct font sizes)',
        'Unique color distribution count',
        'Automatic extraction of primary palette and type scale',
      ],
    },
    {
      name: '5. Layout Stability During Scroll (Weight: 10%)',
      desc: 'Active measurement using PerformanceObserver with layout-shift entries during the human-like scroll phase, distinguishing scroll-induced shifts from initial load.',
      checks: [
        'Scroll-induced CLS measurement during progressive step scrolling',
        'Dynamic sticky element jitter detection',
        'Late-loading unreserved banner shifts',
      ],
    },
    {
      name: '6. UX Heuristics (Weight: 15%)',
      desc: 'Empirically measured usability heuristics without guessing or subjective assumptions.',
      checks: [
        'Primary CTA visible above the fold on Desktop & Mobile',
        'Navigation landmark presence and navigation link count',
        'Sticky header behavior and scroll lock detection',
        'Broken internal links validation (active checks capped at 50 links)',
        'Broken image detection (naturalWidth === 0)',
        'Browser console errors and failed HTTP 4xx/5xx requests',
      ],
    },
    {
      name: '7. SEO Basics (Weight: 10%)',
      desc: 'Verification of fundamental search discoverability elements.',
      checks: [
        'Title tag length optimization (50–60 characters)',
        'Meta description length optimization (150–160 characters)',
        'Single <h1> element verification',
        'Canonical link tag presence',
        'Open Graph protocol tags (og:title, og:image, etc.)',
        'Favicon presence',
        'Direct HTTP fetch check for /robots.txt and /sitemap.xml',
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-black/10 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">How Scores Work</h1>
          <p className="text-sm text-black/60 mt-1">
            FlowLens scoring formula, rubric weights, and empirical measurement principles.
          </p>
        </div>
        <Link href="/" className="px-3 py-1.5 border border-black/20 text-xs font-semibold rounded hover:border-black transition">
          Back to Dashboard
        </Link>
      </div>

      {/* Formula Explanation Card */}
      <section className="border border-black/15 rounded-lg p-6 bg-white space-y-3">
        <h2 className="text-base font-bold text-black uppercase tracking-wider">The Scoring Formula</h2>
        <p className="text-sm text-black/80">
          The Overall Score is calculated as a weighted average of the 7 evaluated categories, each scored from 0 to 100:
        </p>
        <div className="p-4 bg-black/5 border border-black/10 rounded font-mono text-xs text-black">
          Overall Score = (Performance × 0.20) + (Accessibility × 0.20) + (Responsiveness × 0.15) + (UX Heuristics × 0.15) + (Visual Consistency × 0.10) + (Layout Stability × 0.10) + (SEO Basics × 0.10)
        </div>
        <p className="text-xs text-black/60 pt-1">
          <strong>Non-Negotiable Rule:</strong> No dummy, random, or AI-guessed numbers. Every deduction is linked to measured data and recorded evidence.
        </p>
      </section>

      {/* Detailed Categories */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-black">Category Rubrics & Measurement Standards</h2>
        <div className="space-y-4">
          {categories.map((c, i) => (
            <div key={i} className="border border-black/15 rounded-lg p-5 bg-white space-y-2">
              <h3 className="text-base font-bold text-black">{c.name}</h3>
              <p className="text-xs text-black/70">{c.desc}</p>
              <div className="pt-2">
                <span className="text-[11px] font-bold text-black/60 uppercase tracking-wider block mb-1">
                  Specific Automated Checks:
                </span>
                <ul className="text-xs space-y-1">
                  {c.checks.map((ch, j) => (
                    <li key={j} className="flex items-center gap-2 text-black/80">
                      <span className="material-symbols-outlined text-[14px] text-black" aria-hidden="true">
                        check
                      </span>
                      <span>{ch}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
