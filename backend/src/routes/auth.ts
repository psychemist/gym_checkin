import express from 'express';
import { register, login, verifyToken } from '../controllers/authController';

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/verify', verifyToken);

export default router;