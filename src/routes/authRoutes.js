// src/routes/authRoutes.js
import express from 'express';
import { registerUser } from '../controllers/registerUser.js';
import { registerVenueOwner } from '../controllers/registerVenueOwner.js';
import { authValidation } from '../middlewares/authValidation.js';

const router = express.Router();

router.post('/register/user', authValidation, registerUser);
router.post('/register/venue-owner', authValidation, registerVenueOwner);
export default router;
