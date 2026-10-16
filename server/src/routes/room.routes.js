import { Router } from 'express';
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from '../controllers/room.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticateToken, getRooms);
router.get('/:id', authenticateToken, getRoomById);
router.post('/', authenticateToken, authorizeRoles('LANDLORD'), createRoom);
router.put('/:id', authenticateToken, authorizeRoles('LANDLORD'), updateRoom);
router.delete('/:id', authenticateToken, authorizeRoles('LANDLORD'), deleteRoom);

export default router;
