import { Router } from "express";
import  {registerUser,loginUser,logoutUser, refreshAccessToken}  from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { varifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    }, 
    {
        name: "coverImage",
        maxCount: 1
    }
]), registerUser)


router.route("/login").post(loginUser)

// sacored routes
router.route("/logout").post(varifyJwt ,logoutUser)
router.route("/refreshToken").post(refreshAccessToken)


export default router