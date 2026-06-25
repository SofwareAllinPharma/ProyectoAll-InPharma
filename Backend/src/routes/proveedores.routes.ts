import { Router } from 'express';
import { ProveedoresController } from '../controllers/proveedores.controller';
import { requireAuth } from '../middleware/auth';
import { requireRoles } from '../middleware/roles';
import { ROLE_CODES } from '../utils/roles';

const router = Router();
const controller = new ProveedoresController();
router.use(requireAuth);

router.get('/', controller.list);
router.post('/', requireRoles(ROLE_CODES.ADMINSIS, ROLE_CODES.ADMINFAB), controller.create);
router.put('/:id', requireRoles(ROLE_CODES.ADMINSIS, ROLE_CODES.ADMINFAB), controller.update);
router.delete('/:id', requireRoles(ROLE_CODES.ADMINSIS, ROLE_CODES.ADMINFAB), controller.remove);

export default router;
