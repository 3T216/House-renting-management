import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  createNotification,
} from '../controllers/notification.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticateToken, getNotifications);
router.put('/:id/read', authenticateToken, markAsRead);
router.post('/', authenticateToken, authorizeRoles('LANDLORD'), createNotification);

export default router;
