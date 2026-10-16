import { Router } from 'express';
import {
  getDashboardStats,
  getRevenueStats,
} from '../controllers/stats.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

router.get('/dashboard', authenticateToken, authorizeRoles('LANDLORD'), getDashboardStats);
router.get('/revenue', authenticateToken, authorizeRoles('LANDLORD'), getRevenueStats);

export default router;
