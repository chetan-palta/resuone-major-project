import { Router } from 'express';
import { googleLogin, register, login, getSession, logout } from '../controllers/authController';
import { authenticateToken } from '../utils/authMiddleware';

const router = Router();

router.post('/google', googleLogin);
router.post('/register', register);
router.post('/login', login);
router.get('/session', authenticateToken, getSession);
router.post('/logout', logout);

export default router;
