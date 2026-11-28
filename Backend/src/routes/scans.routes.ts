import { Router } from 'express';
import { ScansController } from '../controllers/scans.controller';
import { validateCreateScan } from '../middleware/validation.middleware';

const router = Router();

// API Overview Index
router.get('/', (req, res) => {
  res.json({
    service: 'FlowLens Backend API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      scans: 'GET /api/scans',
      createScan: 'POST /api/scans',
      scanStatus: 'GET /api/scans/:scanId/status',
      scanResults: 'GET /api/scans/:scanId/results',
      scanEvidence: 'GET /api/scans/:scanId/evidence',
    },
  });
});

// Public Scan API Endpoints
router.post('/scans', validateCreateScan, ScansController.createScan);
router.get('/scans', ScansController.listScans);
router.get('/scans/:scanId', ScansController.getScan);
router.get('/scans/:scanId/status', ScansController.getScanStatus);
router.get('/scans/:scanId/results', ScansController.getScanResults);
router.get('/scans/:scanId/evidence', ScansController.getScanEvidence);
router.get('/scans/:scanId/evidence/:evidenceId/url', ScansController.getEvidenceUrl);

// Internal Worker Communication Endpoint
router.post('/internal/worker/callback', ScansController.workerCallback);

export default router;
