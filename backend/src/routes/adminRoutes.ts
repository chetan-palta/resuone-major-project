import express from 'express';
import { getAllResumes } from '../controllers/adminController';

const router = express.Router();

// Get all resumes with user data for admin
router.get('/resumes', getAllResumes);

export default router;
