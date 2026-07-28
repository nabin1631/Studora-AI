const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const User = require("../models/User");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const BADGES = [
    { id: "first_quiz", label: "🎯 First Quiz", condition: (u) => u.totalQuizzes >= 1 },
    { id: "quiz_5", label: "📚 Quiz Enthusiast", condition: (u) => u.totalQuizzes >= 5 },
    { id: "quiz_25", label: "🏆 Quiz Master", condition: (u) => u.totalQuizzes >= 25 },
    { id: "streak_3", label: "🔥 3 Day Streak", condition: (u) => u.streak >= 3 },
    { id: "streak_7", label: "⚡ 7 Day Streak", condition: (u) => u.streak >= 7 },
    { id: "points_100", label: "⭐ 100 Points", condition: (u) => u.points >= 100 },
    { id: "points_500", label: "💎 500 Points", condition: (u) => u.points >= 500 },
    { id: "perfect", label: "✨ Perfect Score", condition: (u, attempt) => attempt && attempt.score === attempt.totalQuestions },
];

const checkAndAwardBadges = (user, attempt = null) => {
    const newBadges = [];
    BADGES.forEach(badge => {
        if (!user.badges.includes(badge.id) && badge.condition(user, attempt)) {
            user.badges.push(badge.id);
            newBadges.push(badge.label);
        }
    });
    return newBadges;
};

const updateStreak = (user) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!user.lastQuizDate) {
        user.streak = 1;
    } else {
        const last = new Date(user.lastQuizDate);
        last.setHours(0, 0, 0, 0);
        const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));

        if (diff === 0) {
            // Same day - no change
        } else if (diff === 1) {
            user.streak += 1;
        } else {
            user.streak = 1;
        }
    }

    user.lastQuizDate = new Date();
};


// Generate AI quiz
const generateQuiz = async (req, res) => {
    try {
        const { subject, topic, difficulty, questionCount = 5 } = req.body;

        if (!subject) {
            return res.status(400).json({
                success: false,
                message: "Subject is required"
            });
        }

        const prompt = `Generate ${questionCount} multiple choice quiz questions about ${topic || subject} for ${difficulty || "medium"} difficulty level.

Return ONLY a valid JSON array with this exact structure, no other text:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A",
    "explanation": "Brief explanation why this is correct"
  }
]

Requirements:
- Make questions educational and relevant for students
- Each question must have exactly 4 options
- The answer must exactly match one of the options
- Explanations should be brief (1-2 sentences)
- Difficulty: ${difficulty || "medium"}
- Subject: ${subject}
- Topic: ${topic || subject}`;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are an expert quiz generator. Always return valid JSON only, no markdown, no extra text." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2000
        });

        let questionsRaw = completion.choices[0].message.content.trim();

        // Clean up response
        questionsRaw = questionsRaw.replace(/```json/g, "").replace(/```/g, "").trim();

        let questions;
        try {
            questions = JSON.parse(questionsRaw);
        } catch {
            return res.status(500).json({
                success: false,
                message: "AI returned invalid format. Please try again."
            });
        }

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(500).json({
                success: false,
                message: "Could not generate questions. Please try again."
            });
        }

        const quiz = await Quiz.create({
            createdBy: req.user._id,
            subject,
            topic: topic || subject,
            difficulty: difficulty || "medium",
            questions,
            type: "ai-generated"
        });

        res.status(201).json({
            success: true,
            quiz
        });

    } catch (error) {
        console.error("Quiz generation error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to generate quiz"
        });
    }
};


// Submit quiz attempt
const submitAttempt = async (req, res) => {
    try {
        const { quizId, answers, timeTaken } = req.body;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            });
        }

        // Calculate score
        let score = 0;
        const processedAnswers = answers.map((ans, i) => {
            const correct = quiz.questions[i]?.answer === ans.selectedAnswer;
            if (correct) score++;
            return {
                questionIndex: i,
                selectedAnswer: ans.selectedAnswer,
                correct,
                timeTaken: ans.timeTaken || 0
            };
        });

        // Calculate points
        let pointsEarned = score * 10;
        if (timeTaken && timeTaken < 60) pointsEarned += 20; // Speed bonus
        if (score === quiz.questions.length) pointsEarned += 50; // Perfect score bonus

        // Save attempt
        const attempt = await QuizAttempt.create({
            user: req.user._id,
            quiz: quizId,
            subject: quiz.subject,
            answers: processedAnswers,
            score,
            totalQuestions: quiz.questions.length,
            pointsEarned,
            timeTaken: timeTaken || 0,
            completed: true
        });

        // Update user stats
        const user = await User.findById(req.user._id);
        user.points += pointsEarned;
        user.totalQuizzes += 1;
        user.totalCorrect += score;
        user.level = Math.floor(user.points / 100) + 1;

        updateStreak(user);

        const newBadges = checkAndAwardBadges(user, { score, totalQuestions: quiz.questions.length });

        await user.save();

        res.json({
            success: true,
            attempt,
            pointsEarned,
            newBadges,
            userStats: {
                points: user.points,
                level: user.level,
                streak: user.streak,
                badges: user.badges
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get user quiz stats
const getStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("points level streak badges totalQuizzes totalCorrect lastQuizDate");

        const attempts = await QuizAttempt.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);

        const subjectStats = await QuizAttempt.aggregate([
            { $match: { user: req.user._id } },
            { $group: {
                _id: "$subject",
                total: { $sum: "$totalQuestions" },
                correct: { $sum: "$score" },
                attempts: { $sum: 1 }
            }}
        ]);

        const leaderboard = await User.find({ totalQuizzes: { $gt: 0 } })
            .select("name points level totalQuizzes")
            .sort({ points: -1 })
            .limit(10);

        res.json({
            success: true,
            user,
            recentAttempts: attempts,
            subjectStats,
            leaderboard
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    generateQuiz,
    submitAttempt,
    getStats
};