import express from "express";
import { sendOtp, verifyOtp, setNameAndPin, verifyPin, userList, getCurrentUser } from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/send-otp", sendOtp);             // public
router.post("/verify-otp", verifyOtp);         // uses short-lived token
router.post("/set-name-pin", auth, setNameAndPin);   // protected
router.post("/verify-pin", auth, verifyPin);  
router.get("/user-list", auth, userList);       // protected
router.get('/me', auth, getCurrentUser);

export default router;
