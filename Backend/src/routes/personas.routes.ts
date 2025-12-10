import { Router } from 'express';
import { getAllPersonas } from '../controllers/persona.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getAllPersonas);

export default router;
