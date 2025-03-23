import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { login } from "../controllers/login.js";
import { validateMiddleware } from "../middlewares/LoginValidateMiddleware.js";

const router = express.Router();

router.post("/" ,validateMiddleware, login);
export default router;