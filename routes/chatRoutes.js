import express from "express";
import { auth } from "../middleware/auth.js";
import { getChatMessages, markAsRead, sendMessage } from "../controllers/chatController.js";

const router = express.Router();

// Protected routes
router.get("/:userId", auth, getChatMessages); // get messages with a user
router.post("/", auth, sendMessage);           // send a message
router.post("/read", auth, markAsRead);        // mark messages as read

export default router;
