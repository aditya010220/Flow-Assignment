# FlowLens — Website UI/UX & Flow Analyzer

FlowLens is an automated, evidence-backed website UX and interaction analysis application. It accepts a website URL, executes an isolated browser session with human-like progressive scrolling, captures checkpoint screenshots and scroll animations, records video sessions, and evaluates the site against the 7 assignment-defined categories.

---

## 1. Architecture Overview

- **Frontend (`frontend/`)**: Next.js 15 App Router, TypeScript, Tailwind CSS, Strict B&W design system (#000000 / #FFFFFF).
- **Backend API (`Backend/`)**: Express.js + TypeScript REST API. Includes strict SSRF guards, job orchestrator, and PostgreSQL repository layer.
- **Worker (`worker/`)**: Dockerized Playwright + Chromium runtime for browser automation, animation detection (GSAP, AOS, Lenis, Locomotive), and evaluation.
- **Database**: Neon PostgreSQL.
- **Object Storage**: Cloudflare R2 for binary screenshot and video assets.

---

## 2. The 7 Evaluated Categories

1. **Performance (20%)**: Programmatic Lighthouse measurements (LCP, CLS, TBT, FCP, total weight, image dimensions).
2. **Accessibility (20%)**: Injected `axe-core` audit grouped by impact, color contrast, tap targets (WCAG 2.2: $\ge 24\times 24\text{ px}$).
3. **Responsiveness (15%)**: Mobile viewport (390×844 px) horizontal overflow detection (`scrollWidth > innerWidth`), text $<12\text{ px}$, and viewport meta tag.
4. **Visual Consistency (10%)**: Computed styles analysis for font families, font sizes, colors, spacing, and palette extraction.
5. **Layout Stability During Scroll (10%)**: Active `PerformanceObserver` layout shift monitoring while scrolling.
6. **UX Heuristics (15%)**: Above-the-fold CTA, navigation presence, sticky header behavior, broken links (up to 50), broken images, console errors.
7. **SEO Basics (10%)**: Title/meta description length, single `<h1>`, canonical tag, Open Graph metadata, favicon, `robots.txt` / `sitemap.xml`.

---

## 3. Quick Start

### Backend

```bash
cd Backend
npm install # or yarn install
npm run dev
```

The Express API will be running at `http://localhost:5000/api`.

### Frontend

```bash
cd frontend
npm install # or yarn install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 4. Key Endpoints

- `POST /api/scans` — Create and queue a new scan (returns 202 Accepted)
- `GET /api/scans` — List scan history with pagination
- `GET /api/scans/:id/status` — Lightweight polling endpoint
- `GET /api/scans/:id/results` — Full structured audit report
- `GET /api/scans/:id/evidence/:evidenceId/url` — Secure signed URL generation
