import express from 'express';
import { analyzeText, submitResume, getResumePdf, getResumeById, exportDirect } from '../controllers/resumeController';

const router = express.Router();

// AI analysis endpoint for text
router.post('/analyze', analyzeText);

// Direct PDF export (no DB required)
router.post('/export-direct', exportDirect);

// Submit and save resume
router.post('/', submitResume);

// Fetch resume JSON for rendering
router.get('/:id', getResumeById);

// Generate and get PDF
router.get('/:id/pdf', getResumePdf);

export default router;
