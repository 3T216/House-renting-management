import { Router } from 'express';
import {
  getInvoices,
  getInvoiceById,
  generateInvoice,
  submitPayment,
  verifyPayment,
  updateInvoiceStatus,
} from '../controllers/invoice.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticateToken, getInvoices);
router.get('/:id', authenticateToken, getInvoiceById);
router.post('/generate', authenticateToken, authorizeRoles('LANDLORD'), generateInvoice);
router.post('/:id/submit-payment', authenticateToken, authorizeRoles('TENANT'), submitPayment);
router.put('/:id/verify-payment', authenticateToken, authorizeRoles('LANDLORD'), verifyPayment);
router.put('/:id/status', authenticateToken, authorizeRoles('LANDLORD'), updateInvoiceStatus);

export default router;
