const express = require("express");
const router = express.Router();

const {
    generateQuiz,
    submitAttempt,
    getStats
} = require("../controllers/quizController");

const { protect } = require("../middleware/authMiddleware");

router.post("/generate", protect, generateQuiz);
router.post("/submit", protect, submitAttempt);
router.get("/stats", protect, getStats);

module.exports = router;