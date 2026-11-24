# FlowLens — API Contract

Base path: `/api`

All endpoints return JSON. The examples are proposed contracts; implement the same shapes consistently in controllers and frontend types.

## 1. Response conventions

### Success

```json
{
  "success": true,
  "data": {},
  "message": "Optional human-readable message"
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The URL is invalid",
    "details": []
  }
}
```

Use appropriate HTTP status codes: `200`, `201`, `202`, `400`, `401` if authentication exists, `404`, `409`, `413`, `422`, `429` and `500`.

## 2. Endpoints

### POST `/scans`

Create a scan.

Request:

```json
{
  "url": "https://example.com",
  "options": {
    "maxPages": 5,
    "captureScreenshots": true
  }
}
```

Response (`202 Accepted`):

```json
{
  "success": true,
  "data": {
    "scanId": "scan_uuid",
    "status": "queued",
    "createdAt": "2026-01-01T10:00:00.000Z"
  }
}
```

Backend responsibilities:
- Validate URL and options.
- Apply SSRF protections.
- Insert scan row with `queued` status.
- Dispatch the worker job.
- Return without waiting for browser execution to finish.

### GET `/scans`

List scan history.

Optional query parameters:
- `page` (default `1`)
- `limit` (default `20`, enforce a maximum)
- `status`
- `sort` (for example `createdAt:desc`)

Response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "scan_uuid",
        "url": "https://example.com",
        "status": "completed",
        "createdAt": "2026-01-01T10:00:00.000Z",
        "completedAt": "2026-01-01T10:01:20.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1
    }
  }
}
```

### GET `/scans/:scanId`

Get scan metadata and current status.

Response:

```json
{
  "success": true,
  "data": {
    "id": "scan_uuid",
    "url": "https://example.com",
    "status": "running",
    "progress": {
      "stage": "capturing",
      "completed": 2,
      "total": 5
    },
    "createdAt": "2026-01-01T10:00:00.000Z"
  }
}
```

Progress may be omitted when it cannot be measured reliably. Do not invent percentages.

### GET `/scans/:scanId/status`

Return the minimal status payload for polling.

```json
{
  "success": true,
  "data": {
    "scanId": "scan_uuid",
    "status": "running",
    "updatedAt": "2026-01-01T10:00:30.000Z"
  }
}
```

### GET `/scans/:scanId/results`

Get the final evaluation report.

```json
{
  "success": true,
  "data": {
    "scanId": "scan_uuid",
    "status": "completed",
    "summary": {
      "overallScore": 82,
      "scoreScale": "0-100"
    },
    "categories": [
      {
        "key": "category_key_from_assignment",
        "name": "Exact assignment category name",
        "score": 80,
        "status": "needs_attention",
        "summary": "Evidence-backed explanation",
        "findings": [
          {
            "id": "finding_uuid",
            "severity": "medium",
            "title": "Finding title",
            "description": "What was observed",
            "recommendation": "Suggested improvement",
            "evidenceIds": ["evidence_uuid"]
          }
        ]
      }
    ],
    "completedAt": "2026-01-01T10:01:20.000Z"
  }
}
```

The seven category entries must use the exact assignment rubric. The example category key and score are illustrative only.

### GET `/scans/:scanId/evidence`

List evidence metadata for a scan.

```json
{
  "success": true,
  "data": [
    {
      "id": "evidence_uuid",
      "type": "screenshot",
      "pageUrl": "https://example.com/",
      "objectKey": "scans/scan_uuid/evidence/home.png",
      "contentType": "image/png",
      "createdAt": "2026-01-01T10:00:40.000Z"
    }
  ]
}
```

Prefer returning a short-lived signed URL or a backend-controlled retrieval URL rather than exposing private storage credentials.

### GET `/scans/:scanId/evidence/:evidenceId/url`

Return a short-lived access URL after verifying that the evidence belongs to the requested scan.

## 3. Internal worker contract

The worker is an internal component, not a public browser-facing API.

A job input should contain:
- `scanId`
- `targetUrl`
- bounded scan options
- correlation/request ID
- a secure mechanism for reporting status/results

A normalized worker result should contain:

```json
{
  "scanId": "scan_uuid",
  "status": "completed",
  "pages": [],
  "evidence": [],
  "categories": [],
  "startedAt": "2026-01-01T10:00:00.000Z",
  "completedAt": "2026-01-01T10:01:20.000Z",
  "warnings": []
}
```

Do not put long-lived secrets in job payloads or logs. Prefer a private Docker network and authenticated internal communication. The backend must validate worker results before persistence.

## 4. Frontend integration

Suggested client functions:

```ts
createScan(input)
listScans(params)
getScan(scanId)
getScanStatus(scanId)
getScanResults(scanId)
getEvidenceUrl(scanId, evidenceId)
```

After `POST /scans`, navigate to the scan detail/progress screen and poll the status endpoint at a bounded interval. Stop polling when the scan reaches a terminal state (`completed`, `failed` or `cancelled`).

## 5. API implementation checklist

- Validate all route parameters and request bodies.
- Enforce maximum URL length and scan options.
- Use a centralized error handler.
- Add request IDs and structured logs.
- Apply rate limits to scan creation.
- Ensure a scan's evidence cannot be accessed through another scan ID.
- Add API tests for success, invalid input, missing scan and worker failure.
