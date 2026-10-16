import { Router } from 'express';
import {
  getReadings,
  getLatestReading,
  recordReading,
} from '../controllers/utility.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticateToken, getReadings);
router.get('/latest/:roomId', authenticateToken, getLatestReading);
router.post('/record', authenticateToken, authorizeRoles('LANDLORD'), recordReading);

export default router;
