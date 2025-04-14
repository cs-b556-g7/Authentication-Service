import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { login, verifyDuo, duoRedirectHandler } from "../controllers/login.js";
import { validateLogin } from "../middlewares/LoginValidateMiddleware.js";


const router = express.Router();

router.post("/login" ,validateLogin, login);
router.get("/duo/callback", duoRedirectHandler); 
router.post("/duo/callback", verifyDuo); 

export default router;