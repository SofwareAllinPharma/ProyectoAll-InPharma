import { Router } from 'express';
import { getWeeklyProduction } from '../controllers/dashboard.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/weekly-production', getWeeklyProduction);

export default router;
