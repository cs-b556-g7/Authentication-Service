import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { login, verifyDuo, duoRedirectHandler } from "../controllers/login.js";
import { validateLogin } from "../middlewares/LoginValidateMiddleware.js";
import { requestPasswordReset, resetPassword } from '../controllers/forgotPassword.js';

const router = express.Router();

router.post("/login" ,validateLogin, login);
router.get("/duo/callback", duoRedirectHandler); 
router.post("/duo/callback", verifyDuo); 

router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;