// src/routes/authRoutes.js
import express from 'express';
import { registerUser } from '../controllers/registerUsers.js';
import { validateRegister } from '../middlewares/RegisterValidateMiddleware.js';

const router = express.Router();

router.post('/register', validateRegister, registerUser);
export default router;
