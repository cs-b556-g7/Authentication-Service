import express from 'express';
import { register } from '../controllers/authController.js';
import { registerValidation } from '../middlewares/authValidation.js';

const router = express.Router();

// Routes
router.post('/register', registerValidation, register);

export default router;