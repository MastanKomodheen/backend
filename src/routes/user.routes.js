import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.midleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()
router.route("/rigister").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)
//secure routes
//every time midleware is ther berofe call needed
router.route("/logout").post(verifyJWT,logoutUser)
export default router