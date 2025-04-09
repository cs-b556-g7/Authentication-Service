import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { login } from "../controllers/login.js";
import { validateLogin } from "../middlewares/LoginValidateMiddleware.js";

const router = express.Router();

router.post("/login" ,validateLogin, login);
export default router;