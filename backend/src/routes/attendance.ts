import express from 'express';
import { checkIn, checkOut, getAttendanceHistory, getCurrentStatus } from '../controllers/attendanceController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All attendance routes require authentication
router.use(authenticateToken);

// Attendance routes
router.post('/checkin', checkIn);
router.post('/checkout', checkOut);
router.get('/history', getAttendanceHistory);
router.get('/status', getCurrentStatus);

export default router;