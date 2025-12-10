import { Router } from 'express';
import { registerUser, getRoles, getAllUsers, updateUser, deactivateUser, activateUser } from '../controllers/adminSis.controller';
import { requireAuth } from '../middleware/auth';
import { requireRoles } from '../middleware/roles';
import { ROLE_CODES } from '../utils/roles';

const router = Router();

router.use(requireAuth);
router.use(requireRoles(ROLE_CODES.ADMINSIS));

router.get("/ping", (_req, res) => {
  res.json({ ok: true, area: "adminsis" });
});

router.post('/users', registerUser);
router.put('/users/:mail', updateUser);
router.post('/users/:mail/deactivate', deactivateUser);
router.post('/users/:mail/activate', activateUser);
router.get('/users', getAllUsers);
router.get('/roles', getRoles);

export default router;
