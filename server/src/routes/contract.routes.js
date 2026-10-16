import { Router } from 'express';
import {
  getContracts,
  createContract,
  terminateContract,
} from '../controllers/contract.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticateToken, getContracts);
router.post('/', authenticateToken, authorizeRoles('LANDLORD'), createContract);
router.put('/:id/terminate', authenticateToken, authorizeRoles('LANDLORD'), terminateContract);

export default router;
