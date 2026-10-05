const express = require("express");
const router = express.Router();

const {
    generateQuiz,
    submitAttempt,
    getStats,
    getBookmarks,
    addBookmark,
    getMistakes,
    masterMistake,
    getDailyChallenge,
    getPerformanceAnalytics,
} = require("../controllers/quizController");

const { protect } = require("../middleware/authMiddleware");

// Quiz generation & submission
router.post("/generate", protect, generateQuiz);
router.post("/submit", protect, submitAttempt);

// Stats & Analytics
router.get("/stats", protect, getStats);
router.get("/analytics", protect, getPerformanceAnalytics);

// Bookmarks
router.get("/bookmarks", protect, getBookmarks);
router.post("/bookmarks", protect, addBookmark);

// Mistake Book
router.get("/mistakes", protect, getMistakes);
router.patch("/mistakes/:id/master", protect, masterMistake);

// Daily Challenge
router.get("/daily-challenge", protect, getDailyChallenge);

module.exports = router;