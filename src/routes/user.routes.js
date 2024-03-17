import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
const router=Router()
router.route("/rigister").post(registerUser)
export default router