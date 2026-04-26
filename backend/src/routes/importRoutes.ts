import { Router } from 'express';
import multer from 'multer';
import { importResume } from '../controllers/importController';

const router = Router();

// Configure multer for in-memory storage (buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Only PDF and DOCX files are accepted.'));
    }
  },
});

// POST /api/resume/import
router.post('/import', upload.single('resumeFile'), importResume);

// Prompt requested aliases
import { submitResume, getResumeById, getUserResumes } from '../controllers/resumeController';
import { authenticateToken } from '../utils/authMiddleware';
import { Request, Response } from 'express';
import pool from '../config/db';

router.post('/save', authenticateToken, submitResume);
router.put('/update', authenticateToken, submitResume);

router.get('/user', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const [rows]: any = await pool.query('SELECT * FROM resumes WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1', [userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'No resume found' });
    const dbData = rows[0];
    const resumeData = dbData.resume_data || { personalDetails: dbData.personal_details || {}, summary: dbData.summary || '', education: dbData.education || [], skills: dbData.skills || [], projects: dbData.projects || [], experience: dbData.experience || [], extraCurricular: dbData.extra_curricular || [] };
    res.json({ id: dbData.id, ...resumeData });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:userId', authenticateToken, async (req: Request, res: Response) => {
  if (req.params.userId === 'user') return; // Handled above
  try {
    const [rows]: any = await pool.query('SELECT * FROM resumes WHERE user_id = ? ORDER BY updated_at DESC', [req.params.userId]);
    res.json({ resumes: rows });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
