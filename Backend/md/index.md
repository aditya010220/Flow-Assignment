# FlowLens — Documentation Index

## 1. Project overview

FlowLens is a website UX and interaction analysis application. A user submits a website URL, FlowLens runs a browser-based inspection, captures evidence, evaluates the website against the assignment's seven required categories, and presents a structured report with screenshots and interaction-flow information.

This repository is organized as a small monorepo:

```text
flowlens/
├── frontend/                 # Next.js + TypeScript user interface
├── backend/                  # Express.js API and scan orchestration
├── worker/                   # Dockerized Playwright/Chromium worker
├── docs/
│   ├── index.md
│   ├── prd.md
│   ├── api.md
│   ├── design.md
│   ├── database.md
│   ├── architecture.md
│   ├── schema.md
│   ├── service.md
│   └── workflow.md
├── docker-compose.yml        # Local/Codespaces worker orchestration
├── .env.example              # Environment-variable template (no secrets)
├── package.json              # Optional root scripts/workspaces
└── README.md                 # Setup and quick-start guide
```

> The paths above are the recommended target structure. Create `docs/` and place these documentation files there. If the repository already has a different structure, update the paths to match the implementation rather than duplicating existing folders.

## 2. Documentation map

| Document | What it defines |
|---|---|
| [PRD](./prd.md) | Problem, goals, scope, user stories and acceptance criteria |
| [API](./api.md) | HTTP endpoints, payloads, status codes and API conventions |
| [Design](./design.md) | Black-and-white visual system, components and icon rules |
| [Database](./database.md) | Persistence strategy, entities and data lifecycle |
| [Architecture](./architecture.md) | System components, boundaries and communication |
| [Schema](./schema.md) | PostgreSQL tables, columns, indexes and relationships |
| [Services](./service.md) | Backend modules, responsibilities and interfaces |
| [Workflow](./workflow.md) | Developer setup, scan execution and deployment/testing flow |

## 3. Technology choices

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | Next.js, React, TypeScript | Dashboard, scan form, progress, reports and flow viewer |
| Styling | Tailwind CSS | Responsive UI and black-and-white design tokens |
| Backend | Node.js, Express.js, TypeScript | REST API, validation, orchestration and persistence |
| Browser automation | Playwright + Chromium | Website navigation, interaction and evidence capture |
| Worker runtime | Docker | Isolated, reproducible browser execution |
| Database | Neon PostgreSQL | Scan metadata, status, evaluations and history |
| Object storage | Cloudflare R2 | Screenshots, videos and other generated evidence |
| Development | GitHub Codespaces | Cloud development environment and Docker execution |

Use one package manager consistently. The examples in this documentation use Yarn; adapt commands if the repository uses npm or pnpm.

## 4. Repository responsibilities

### `frontend/`

Suggested structure:

```text
frontend/
├── src/
│   ├── app/                  # Next.js routes and layouts
│   ├── components/           # Shared UI components
│   ├── features/
│   │   ├── scans/            # Scan form, status and history
│   │   ├── reports/          # Evaluation report and evidence
│   │   └── flow-viewer/      # Interaction-flow visualization
│   ├── lib/                  # API client and shared utilities
│   ├── hooks/                # Reusable React hooks
│   └── types/                # Frontend TypeScript types
└── package.json
```

### `backend/`

```text
backend/
├── src/
│   ├── app.ts                # Express app configuration
│   ├── server.ts             # HTTP server entry point
│   ├── routes/                # Route registration
│   ├── controllers/           # HTTP request/response handlers
│   ├── services/              # Business logic
│   ├── repositories/          # Database access
│   ├── middleware/            # Validation, errors and security
│   ├── jobs/                  # Worker dispatch and status handling
│   ├── config/                # Environment and service configuration
│   └── types/                 # Shared backend types
└── package.json
```

### `worker/`

```text
worker/
├── Dockerfile
├── package.json
└── src/
    ├── index.ts               # Worker entry point
    ├── browser.ts             # Playwright browser lifecycle
    ├── crawler.ts             # Page navigation and discovery
    ├── interactions.ts        # Safe interaction collection
    ├── capture.ts             # Screenshot/video capture
    ├── evaluator.ts            # Seven-category evaluation pipeline
    ├── evidence.ts             # Evidence manifest creation
    └── types.ts
```

## 5. Implementation rules

1. Keep frontend, backend and worker responsibilities separate.
2. The Playwright worker must genuinely execute inside a Docker container.
3. Do not expose database credentials or R2 keys to the browser.
4. Store large binary evidence in R2; store metadata and object keys in PostgreSQL.
5. Treat website content as untrusted input. Do not execute arbitrary user-supplied scripts or follow unsafe navigation.
6. Every evaluation finding should reference evidence where possible.
7. Keep evaluation category names and scoring rules aligned with the supplied assignment document. Do not invent category labels or weights.
8. Use environment variables for secrets and commit only `.env.example`.
9. Make scan states explicit and persist them so interrupted jobs can be diagnosed.
10. Do not treat a successful HTTP response as proof that a scan completed correctly; verify worker output and persisted evidence.

## 6. Recommended build order

1. Repository setup and frontend screens using mock data.
2. Backend API contracts and validation.
3. PostgreSQL schema and repositories.
4. Dockerized Playwright worker with one basic URL capture.
5. Evidence upload to Cloudflare R2.
6. Evaluation pipeline for the seven assignment categories.
7. Frontend/backend/worker integration.
8. Error handling, security checks, tests and README.

See [workflow.md](./workflow.md) for the detailed sequence.
