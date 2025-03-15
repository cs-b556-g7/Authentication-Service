import express from 'express';
import { body } from 'express-validator';
import { register } from '../controllers/authController.js';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['user', 'venue_owner']).withMessage('Invalid role')
];

// Routes
router.post('/register', registerValidation, register);

export default router;