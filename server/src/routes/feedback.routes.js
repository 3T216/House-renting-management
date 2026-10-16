import { Router } from 'express';
import {
  getFeedbacks,
  createFeedback,
  replyFeedback,
} from '../controllers/feedback.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticateToken, getFeedbacks);
router.post('/', authenticateToken, authorizeRoles('TENANT'), createFeedback);
router.put('/:id/reply', authenticateToken, authorizeRoles('LANDLORD'), replyFeedback);

export default router;
