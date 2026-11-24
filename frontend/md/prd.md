# FlowLens — Product Requirements Document (PRD)

## 1. Product summary

FlowLens is a website analysis tool that accepts a target URL, inspects the site through a real browser session, captures screenshots and interaction evidence, evaluates the site against seven assignment-defined categories, and generates a structured report.

The product must demonstrate a complete working path from URL submission to evidence-backed results. A static dashboard or mocked report alone is not sufficient for final acceptance.

## 2. Problem statement

Reviewing a website manually can be repetitive and difficult to document consistently. FlowLens aims to automate a repeatable portion of this review by collecting browser evidence and organizing findings into a report that a reviewer can inspect.

## 3. Goals

- Allow a user to submit a valid website URL.
- Create and track a scan job.
- Execute website inspection in an isolated Dockerized Playwright/Chromium worker.
- Capture relevant screenshots and, where required, interaction-flow evidence.
- Evaluate the website against the seven categories specified in the assignment.
- Associate findings with evidence and clear explanations.
- Persist scan metadata, results and history in PostgreSQL.
- Store binary artifacts in Cloudflare R2.
- Present scan progress and final results in the frontend.

## 4. Non-goals

Unless the assignment explicitly requires them, the initial release does not include:

- A multi-tenant enterprise permission system.
- A billing or subscription platform.
- An unrestricted web crawler.
- Guaranteed analysis of authenticated websites.
- Guaranteed coverage of every page or interaction on a large website.
- Automatic remediation or modification of the target website.
- A claim that automated scores replace expert UX review.

## 5. Primary user journey

1. User opens the FlowLens dashboard.
2. User enters a website URL and submits a scan.
3. Frontend sends a request to the backend.
4. Backend validates the URL and creates a scan record.
5. Backend dispatches a job to the worker.
6. Worker launches Chromium in Docker and inspects the target site within configured limits.
7. Worker captures screenshots and structured evidence.
8. Evidence files are uploaded to R2.
9. Evaluation results and evidence metadata are saved in PostgreSQL.
10. Backend marks the scan completed or failed.
11. Frontend displays progress, report, findings and evidence.

## 6. Functional requirements

### FR-01: URL submission

- Provide a clearly labeled URL input.
- Validate URL syntax on the client for usability and again on the server for security.
- Accept only supported protocols, normally `https` and `http`.
- Reject localhost, private IP ranges, link-local addresses and other prohibited destinations unless the assignment explicitly provides a safe test environment.
- Show understandable validation errors.

### FR-02: Scan creation

- Create a unique scan identifier.
- Persist the initial scan state before dispatching work.
- Return the scan identifier and initial status to the frontend.
- Prevent duplicate accidental submissions where practical.

### FR-03: Worker execution

- Run Playwright and Chromium inside a Docker container.
- Apply navigation timeouts, page limits, depth limits and execution time limits.
- Capture browser console errors and navigation failures when useful.
- Record the final URL and timestamps for inspected pages.
- Handle target-site failures without crashing the API process.

### FR-04: Evidence capture

- Capture screenshots at defined checkpoints.
- Store evidence in Cloudflare R2.
- Store object keys, content type, size, page URL and capture metadata in PostgreSQL.
- Associate evidence with the relevant scan and finding.

### FR-05: Evaluation

- Evaluate against exactly the seven categories and rubric supplied by the assignment.
- Return a score, status, explanation and supporting evidence references for each category, where the rubric supports scoring.
- Separate observed facts from inferred recommendations.
- Include limitations when evidence is incomplete.
- Do not fabricate evidence or claim an interaction was tested if it was not.

**Rubric configuration requirement:** The exact seven category names, definitions, weights, score ranges and pass thresholds must be transcribed from the assignment source into a versioned configuration. They are intentionally not guessed in this document.

### FR-06: Progress and status

Use the following canonical states:

- `queued`
- `running`
- `completed`
- `failed`
- `cancelled` (optional, if cancellation is implemented)

The UI must show the current state and a useful error message for failed scans.

### FR-07: Results and history

- Show scan summary and category-level results.
- Show findings and associated evidence.
- Allow a user to open a previous scan.
- Display timestamps and target URL.
- Provide a clear empty state when no scans exist.

## 7. Non-functional requirements

### Reliability
- A worker failure must update the scan to `failed` where possible.
- A scan must not remain `running` indefinitely; implement a timeout or stale-job recovery mechanism.
- API errors must use a consistent response format.

### Performance
- Return scan creation quickly; do not keep the HTTP request open for the entire browser inspection.
- Use asynchronous worker execution.
- Apply bounded concurrency and resource limits.

### Security
- Protect against server-side request forgery (SSRF).
- Revalidate DNS resolution and every redirect destination before navigation.
- Block private, loopback, link-local and metadata-service IP ranges.
- Do not allow arbitrary file access from the worker.
- Keep R2 and database secrets on the server.
- Limit request sizes, URL length, scan duration and artifact size.
- Treat page text, HTML and browser output as untrusted data.

### Maintainability
- Use TypeScript types for API contracts and worker results.
- Keep routes, services and repositories separate.
- Log scan IDs with relevant events.
- Keep configuration outside source code.

## 8. Acceptance criteria

A release is acceptable when all of the following are demonstrated:

1. A user can submit a valid public website URL.
2. The backend creates and persists a scan.
3. A Docker container runs the Playwright worker.
4. The worker opens the target website in Chromium.
5. The worker captures actual evidence.
6. Evidence is uploaded to R2 and can be retrieved through a controlled backend route or signed URL.
7. Results for all seven required categories are produced according to the assignment rubric, with limitations disclosed.
8. Scan status changes correctly from queued to running to completed or failed.
9. The report is persisted in PostgreSQL and remains available after page refresh.
10. The frontend presents the report and evidence without relying on hardcoded mock results.
11. The README explains how to configure and run the project.
12. No secrets are committed to Git.

## 9. Assumptions and items to confirm

- Exact seven evaluation categories and their scoring rubric: copy from the assignment brief.
- Whether video recording is mandatory or screenshots are sufficient: verify against the assignment brief.
- Whether authentication is required: do not add it unless specified.
- Required browser coverage, page depth and interaction types: configure to match assignment constraints.
- Whether a flow diagram must be interactive or can be a static visualization: verify the expected deliverable.

## 10. Release phases

- **MVP:** URL submission, scan persistence, Docker worker, screenshot capture and basic report.
- **Assignment-complete:** all seven rubric categories, evidence-backed findings, R2 storage, history and complete end-to-end test.
- **Polish:** responsive states, robust failure handling, accessibility, security hardening and documentation.
