# FlowLens — Backend Services

## 1. Service-layer principles

Controllers handle HTTP concerns. Services implement business rules. Repositories handle database access. The worker performs browser automation and evidence collection.

Recommended request path:

```text
Express Route
    -> Validation Middleware
        -> Controller
            -> Service
                -> Repository / Worker Client / R2 Client
```

Do not put Playwright browser logic inside an Express controller.

## 2. Core services

### `ScanService`

Responsibilities:
- Validate scan options after request validation.
- Normalize the target URL.
- Create a scan record.
- Dispatch a worker job.
- Read scan details, status and history.
- Coordinate completion/failure transitions.

Suggested methods:

```ts
createScan(input: CreateScanInput): Promise<ScanCreated>;
getScan(scanId: string): Promise<ScanRecord | null>;
listScans(query: ScanListQuery): Promise<Paginated<ScanRecord>>;
getStatus(scanId: string): Promise<ScanStatusResult>;
markRunning(scanId: string): Promise<void>;
markCompleted(scanId: string, result: WorkerResult): Promise<void>;
markFailed(scanId: string, error: SafeScanError): Promise<void>;
```

### `WorkerService` / `WorkerClient`

Responsibilities:
- Dispatch a scan to the Docker worker.
- Pass only the required bounded job payload.
- Receive status and result callbacks.
- Validate callback authentication and payload shape.
- Handle worker timeout and retry policy.

Do not retry a non-idempotent scan blindly. Use a job identifier and idempotency strategy.

### `EvaluationService`

Responsibilities:
- Load the exact versioned seven-category rubric.
- Convert observations into category evaluations.
- Ensure every finding has a traceable explanation and evidence reference where available.
- Validate scores against the configured scale.
- Calculate an overall score only if the assignment defines the formula.

The service must not invent category names, scoring weights or evidence.

### `EvidenceService`

Responsibilities:
- Upload screenshot/video buffers or files to R2.
- Generate deterministic, scan-scoped object keys.
- Persist evidence metadata.
- Generate short-lived signed URLs.
- Verify scan/evidence ownership before access.

### `UrlSafetyService`

Responsibilities:
- Parse and normalize URLs.
- Allow only supported protocols.
- Reject local/private/reserved IP destinations.
- Validate DNS results and redirects.
- Defend against SSRF and DNS rebinding as far as the runtime permits.
- Enforce URL and navigation limits.

### `ReportService`

Responsibilities:
- Fetch scan, category evaluations, findings and evidence.
- Assemble the API report response.
- Ensure the report belongs to the requested scan.
- Return consistent ordering and pagination where needed.

## 3. Repository layer

Suggested repositories:

- `ScanRepository`
- `ScanPageRepository`
- `EvaluationRepository`
- `FindingRepository`
- `EvidenceRepository`
- `ScanEventRepository`

Repositories should contain database queries only. Keep HTTP response formatting out of repositories.

## 4. Worker modules

Within `worker/src/`:

| Module | Responsibility |
|---|---|
| `index.ts` | Read job, coordinate execution and report outcome |
| `browser.ts` | Launch/close Chromium and create browser context |
| `crawler.ts` | Visit pages within depth/page/time limits |
| `interactions.ts` | Collect safe interaction evidence |
| `capture.ts` | Capture screenshots and optional video |
| `evaluator.ts` | Evaluate observations against rubric |
| `evidence.ts` | Upload artifacts and create metadata |
| `types.ts` | Worker input/output contracts |

Always close browser contexts and the browser in `finally` blocks.

## 5. Error handling

Use safe, typed error codes, for example:

- `INVALID_URL`
- `URL_BLOCKED`
- `SCAN_NOT_FOUND`
- `NAVIGATION_TIMEOUT`
- `WORKER_UNAVAILABLE`
- `BROWSER_LAUNCH_FAILED`
- `EVIDENCE_UPLOAD_FAILED`
- `EVALUATION_FAILED`
- `INTERNAL_ERROR`

Persist a safe error message for the UI. Send detailed diagnostic information only to protected server logs.

## 6. Logging and observability

Include:
- `scanId`
- `jobId`
- component/service name
- event name
- duration
- safe error code

Avoid logging:
- secrets
- database connection strings
- R2 credentials
- private signed URLs
- sensitive page content unless explicitly required and protected

## 7. Testing

- Unit-test URL validation, rubric calculations and state transitions.
- Integration-test repositories against a test database.
- Test R2 upload and signed URL generation.
- Test worker behavior against controlled test pages.
- Test the full flow from scan creation to persisted report.
