import { Router } from 'express';
import { googleLogin, googleAuthInitiate, googleAuthCallback, register, login, getSession, logout } from '../controllers/authController';
import { authenticateToken } from '../utils/authMiddleware';

const router = Router();

router.post('/google', googleLogin);
router.get('/google/url', googleAuthInitiate);
router.get('/google/callback', googleAuthCallback);
router.post('/register', register);
router.post('/login', login);
router.get('/session', authenticateToken, getSession);
router.post('/logout', logout);

export default router;
