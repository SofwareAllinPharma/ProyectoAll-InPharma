import { Router } from 'express';
import { getWeeklyProduction } from '../controllers/dashboard.controller';

const router = Router();

router.get('/weekly-production', getWeeklyProduction);

export default router;
