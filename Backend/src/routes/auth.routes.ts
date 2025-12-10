import { Router } from 'express';
import { login, register, forgotPassword, resetPassword,me, logout } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', requireAuth, me);
router.post('/logout', requireAuth, logout);

export default router;