import express from 'express';
import { analyzeText, submitResume, getResumePdf, getResumeById, exportDirect, getUserResumes, deleteResume } from '../controllers/resumeController';
import { authenticateToken } from '../utils/authMiddleware';

const router = express.Router();

// AI analysis endpoint for text
router.post('/analyze', analyzeText);

// Direct PDF export (no DB required)
router.post('/export-direct', exportDirect);

// Get all resumes for authenticated user
router.get('/', authenticateToken, getUserResumes);

// Submit and save resume
router.post('/', authenticateToken, submitResume);

// Fetch resume JSON for rendering
router.get('/:id', getResumeById);

// Delete resume
router.delete('/:id', authenticateToken, deleteResume);

// Generate and get PDF
router.get('/:id/pdf', getResumePdf);

export default router;
