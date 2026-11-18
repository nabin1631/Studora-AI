const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const {
    generateQuiz,
    checkQuizAnswer,
    submitAttempt,
    getStats,
    getBookmarks,
    addBookmark,
    getMistakes,
    masterMistake,
    getDailyChallenge,
    getAllQuizzes,
    getPerformanceAnalytics,
} = require("../controllers/quizController");

const { protect } = require("../middleware/authMiddleware");

// AI Quiz Generation Rate Limiter
const quizGenerateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,

    keyGenerator: (req) => req.user._id.toString(),

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many quiz generation requests. Please try again after 15 minutes."
    }
});
// Browse quizzes created by all users
router.get("/all", protect, getAllQuizzes);
// Quiz generation & submission
router.post("/generate", protect, quizGenerateLimiter, generateQuiz);
router.post("/check-answer", protect, checkQuizAnswer);
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