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

export default router;
