import { Router } from 'express';
import { login, register, forgotPassword, resetPassword,me } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', requireAuth, me);
//router.post('/logout', requireAuth ); //falta el handler (controlador) de logout

export default router;