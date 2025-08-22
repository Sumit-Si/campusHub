import { Router } from "express";
import { checkRole, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


export default router;
