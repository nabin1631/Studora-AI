const express = require("express");
const router = express.Router();

const {
    sendMessage,
    getChats,
    getChat,
    deleteChat
} = require("../controllers/chatController");

const { protect } = require("../middleware/authMiddleware");

router.post("/message", protect, sendMessage);
router.get("/", protect, getChats);
router.get("/:id", protect, getChat);
router.delete("/:id", protect, deleteChat);

module.exports = router;