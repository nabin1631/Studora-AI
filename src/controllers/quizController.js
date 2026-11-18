const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const User = require("../models/User");
const Bookmark = require("../models/Bookmark");
const MistakeBook = require("../models/MistakeBook");
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

// Generate AI quiz with batching support
const generateQuiz = async (req, res) => {
    try {
        const { subject, topic, difficulty, questionCount = 5 } = req.body;

        if (!subject) {
            return res.status(400).json({
                success: false,
                message: "Subject is required"
            });
        }

        const count = Math.min(parseInt(questionCount), 50);
        const batchSize = 10;
        const batches = Math.ceil(count / batchSize);
        let allQuestions = [];

        for (let batch = 0; batch < batches; batch++) {
            const batchCount = Math.min(batchSize, count - (batch * batchSize));
            const startIndex = batch * batchSize + 1;

            const prompt = `Generate exactly ${batchCount} multiple choice quiz questions about ${topic || subject} for ${difficulty || "medium"} difficulty level.${batches > 1 ? ` This is batch ${batch + 1} of ${batches}. Start from question ${startIndex}. Make sure questions are DIFFERENT from previous batches.` : ""} Return ONLY a valid JSON array, no other text, no markdown:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A",
    "explanation": "Brief explanation (1-2 sentences)"
  }
]
Requirements:
- Exactly ${batchCount} questions
- Each question must have exactly 4 options
- Answer must exactly match one of the options
- Difficulty: ${difficulty || "medium"}
- Subject: ${subject}
- Topic: ${topic || subject}
- No duplicate questions
- Educational and accurate`;

            const completion = await groq.chat.completions.create({
                model: "openai/gpt-oss-120b",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert quiz generator. Always return valid JSON arrays only. No markdown, no extra text, no code blocks."
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7 + (batch * 0.05),
                max_tokens: 4096
            });

            let raw = completion.choices[0].message.content.trim();
            raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();

            // Extract JSON array even if there's extra text
            const match = raw.match(/\[[\s\S]*\]/);
            if (!match) {
                console.error(`Batch ${batch + 1} failed to parse:`, raw.slice(0, 200));
                continue;
            }

            try {
                const batchQuestions = JSON.parse(match[0]);
                if (Array.isArray(batchQuestions)) {
                    allQuestions = [...allQuestions, ...batchQuestions];
                }
            } catch (parseErr) {
                console.error(`Batch ${batch + 1} JSON parse error:`, parseErr.message);
                continue;
            }
        }

        if (allQuestions.length === 0) {
            return res.status(500).json({
                success: false,
                message: "AI could not generate questions. Please try again."
            });
        }

        // Remove duplicates
        const seen = new Set();
        allQuestions = allQuestions.filter(q => {
            if (seen.has(q.question)) return false;
            seen.add(q.question);
            return true;
        });

        // Trim to requested count
        allQuestions = allQuestions.slice(0, count);

        const quiz = await Quiz.create({
            createdBy: req.user._id,
            subject,
            topic: topic || subject,
            difficulty: difficulty || "medium",
            questions: allQuestions,
            type: "ai-generated"
        });

        res.status(201).json({
            success: true,
            quiz
        });

    } catch (error) {
    console.error("Quiz generation error:", error);

    return res.status(500).json({
        success: false,
        message: "Unable to generate quiz right now. Please try again later."
    });
}
};

// Check one quiz answer (practice mode)
const checkQuizAnswer = async (req, res) => {
    try {
        const { quizId, questionIndex, selectedAnswer } = req.body;

        if (
            typeof quizId !== "string" ||
            !/^[a-fA-F0-9]{24}$/.test(quizId) ||
            !Number.isInteger(questionIndex) ||
            typeof selectedAnswer !== "string" ||
            !selectedAnswer.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid answer submission"
            });
        }


        const quiz = await Quiz.findById(quizId);


        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            });
        }

        if (
            questionIndex < 0 ||
            questionIndex >= quiz.questions.length
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid question index"
            });
        }

        const question = quiz.questions[questionIndex];

        if (!question.options.includes(selectedAnswer.trim())) {
            return res.status(400).json({
                success: false,
                message: "Selected option is invalid"
            });
        }

        return res.json({
            success: true,
            correct: question.answer === selectedAnswer.trim(),
            answer: question.answer,
            explanation: question.explanation || ""
        });

    } catch (error) {
        console.error("Quiz answer check error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to check this answer. Please try again."
        });
    }
};


// Submit quiz attempt
const submitAttempt = async (req, res) => {
    let session;

    try {
        session = await mongoose.startSession();
        const { quizId, answers, timeTaken } = req.body;

        if (!mongoose.Types.ObjectId.isValid(quizId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz ID"
            });
        }

        if (!Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: "Answers must be an array"
            });
        }

        let responseData = null;

        const executeTransaction = async (forceRetake = false) => {
            await session.withTransaction(async () => {

                const quiz = await Quiz.findById(quizId).session(session);

                if (!quiz) {
                    const error = new Error("Quiz not found");
                    error.statusCode = 404;
                    throw error;
                }

                if (!quiz.questions.length || answers.length > quiz.questions.length) {
                    const error = new Error("Invalid number of answers");
                    error.statusCode = 400;
                    throw error;
                }

                // Check whether this user has attempted this quiz before.
                const previousAttempt = await QuizAttempt.findOne({
                    user: req.user._id,
                    quiz: quizId
                }).session(session);

                const isFirstAttempt = !forceRetake && !previousAttempt;

                // Calculate score using trusted database answers.
                let score = 0;

                const processedAnswers = quiz.questions.map((question, i) => {
                    const submittedAnswer = answers[i] || {};

                    const selectedAnswer =
                        typeof submittedAnswer.selectedAnswer === "string"
                            ? submittedAnswer.selectedAnswer
                            : "";

                    const correct = question.answer === selectedAnswer;

                    if (correct) score++;

                    return {
                        questionIndex: i,
                        selectedAnswer,
                        correct,
                        timeTaken: Math.max(
                            0,
                            Number(submittedAnswer.timeTaken) || 0
                        )
                    };
                });

                // First attempt only: 10 points per correct answer.
                // Perfect score earns an additional 50 points.
                // No speed bonus.
                let pointsEarned = 0;

                if (isFirstAttempt) {
                    pointsEarned = score * 10;

                    if (score === quiz.questions.length) {
                        pointsEarned += 50;
                    }
                }

                // Save every completed attempt.
                const attempt = new QuizAttempt({
                    user: req.user._id,
                    quiz: quizId,
                    subject: quiz.subject,
                    answers: processedAnswers,
                    score,
                    totalQuestions: quiz.questions.length,
                    pointsEarned,
                    timeTaken: Math.max(0, Number(timeTaken) || 0),
                    completed: true,
                    isFirstAttempt
                });

                await attempt.save({ session });

                // Update user statistics on every completed attempt.
                const user = await User.findById(req.user._id).session(session);

                if (!user) {
                    const error = new Error("User not found");
                    error.statusCode = 404;
                    throw error;
                }

                // Only first attempts earn points.
                user.points += pointsEarned;

                user.totalQuizzes += 1;
                user.totalCorrect += score;
                user.level = Math.floor(user.points / 100) + 1;

                updateStreak(user);

                const newBadges = checkAndAwardBadges(user, {
                    score,
                    totalQuestions: quiz.questions.length
                });

                await user.save({ session });

                // Update Mistake Book on every attempt.
                for (let i = 0; i < processedAnswers.length; i++) {

                    if (!processedAnswers[i].correct) {
                        const question = quiz.questions[i];

                        const existing = await MistakeBook.findOne({
                            user: req.user._id,
                            question: question.question
                        }).session(session);

                        if (!existing) {
                            const mistake = new MistakeBook({
                                user: req.user._id,
                                question: question.question,
                                options: question.options,
                                answer: question.answer,
                                explanation: question.explanation || "",
                                subject: quiz.subject,
                                userAnswer: processedAnswers[i].selectedAnswer
                            });

                            await mistake.save({ session });

                        } else {
                            existing.reviewedCount += 1;
                            existing.userAnswer = processedAnswers[i].selectedAnswer;
                            existing.mastered = false;

                            await existing.save({ session });
                        }
                    }
                }

                responseData = {
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
                };
            });
        };

        try {
            // Try to claim the first-attempt reward.
            await executeTransaction(false);

        } catch (error) {

            // If another simultaneous submission claimed the first attempt,
            // retry this submission as a retake.
           const isFirstAttemptDuplicate =
    error.code === 11000 &&
    (
        error.message?.includes("unique_first_attempt_per_user_quiz") ||
        (
            error.keyPattern?.user === 1 &&
            error.keyPattern?.quiz === 1 &&
            Object.keys(error.keyPattern).length === 2
        )
    );

            if (!isFirstAttemptDuplicate) {
                throw error;
            }

            responseData = null;

            await executeTransaction(true);
        }

        return res.json(responseData);

    } catch (error) {
        console.error("Quiz submission error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Unable to complete this quiz. Please try again later."
        });

    } finally {
    if (session) {
        await session.endSession();
    }
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
            { $match: { user: req.user._id, completed: true } },
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
    console.error("Quiz dashboard error:", error);

    return res.status(500).json({
        success: false,
        message: "Unable to load quiz dashboard. Please try again later."
    });
    }
     };

// Get bookmarks
const getBookmarks = async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            bookmarks,
            count: bookmarks.length
        });
        } catch (error) {
        console.error("Get bookmarks error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load bookmarks. Please try again later."
        });
    }
};

// Add / toggle bookmark
const addBookmark = async (req, res) => {
    try {
        const { quizId, questionIndex } = req.body;

        if (
            typeof quizId !== "string" ||
            !/^[a-fA-F0-9]{24}$/.test(quizId) ||
            !Number.isInteger(questionIndex) ||
            questionIndex < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid bookmark request"
            });
        }

               // Any logged-in user can bookmark questions from any quiz.
        const quiz = await Quiz.findById(quizId);

        if (!quiz || questionIndex >= quiz.questions.length) {
            return res.status(404).json({
                success: false,
                message: "Quiz or question not found"
            });
        }

        // Get trusted question data from the database
        const q = quiz.questions[questionIndex];

        const existing = await Bookmark.findOne({
            user: req.user._id,
            quizId: quiz._id,
            question: q.question
        });

        if (existing) {
            await existing.deleteOne();

            return res.json({
                success: true,
                bookmarked: false,
                message: "Bookmark removed"
            });
        }

        const bookmark = await Bookmark.create({
            user: req.user._id,
            question: q.question,
            options: q.options,
            answer: q.answer,
            explanation: q.explanation || "",
            subject: quiz.subject,
            quizId: quiz._id
        });

        return res.status(201).json({
            success: true,
            bookmarked: true,
            bookmark
        });

    } catch (error) {
        console.error("Bookmark error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to save bookmark. Please try again later."
        });
    }
};
// Get mistake book
const getMistakes = async (req, res) => {
    try {
        const mistakes = await MistakeBook.find({ user: req.user._id, mastered: false }).sort({ createdAt: -1 });
        res.json({ success: true, mistakes });
            } catch (error) {
        console.error("Get mistakes error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load mistakes. Please try again later."
        });
    }
};

// Mark mistake as mastered
const masterMistake = async (req, res) => {
    try {
        const mistake = await MistakeBook.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { mastered: true },
            { new: true }
        );
        res.json({ success: true, mistake });
        } catch (error) {
        console.error("Master mistake error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update mistake status. Please try again later."
        });
    }
};

// Get daily challenge
const getDailyChallenge = async (req, res) => {
    try {
        const today = new Date(); 
        today.setHours(0, 0, 0, 0);
        const subjects = ["Math", "Physics", "Chemistry", "Biology", "English", "Computer Science", "General Knowledge"];
        const todaySubject = subjects[today.getDate() % subjects.length];
        res.json({
            success: true,
            challenge: {
                subject: todaySubject,
                questionCount: 20,
                difficulty: "medium",
                reward: 100,
                date: today,
            }
        });
        } catch (error) {
        console.error("Get daily challenge error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load the daily challenge. Please try again later."
        });
    }
};

// Get performance analytics
const getPerformanceAnalytics = async (req, res) => {
    try {
       const attempts = await QuizAttempt.find({
    user: req.user._id,
    completed: true
})
    .populate("quiz", "topic subject difficulty")
    .sort({ createdAt: -1 })
    .limit(20);

            const allAttempts = await QuizAttempt.find({
            user: req.user._id,
            completed: true
        }).select("score totalQuestions timeTaken");

        const subjectPerformance = await QuizAttempt.aggregate([
              { $match: { user: req.user._id, completed: true } },
            { $group: {
                _id: "$subject",
                totalQuestions: { $sum: "$totalQuestions" },
                totalCorrect: { $sum: "$score" },
                attempts: { $sum: 1 },
                avgScore: { $avg: { $multiply: [{ $divide: ["$score", "$totalQuestions"] }, 100] } }
            }},
            { $sort: { avgScore: -1 } }
        ]);

        const chartData = attempts.slice(0, 10).reverse().map((a, i) => ({
            label: `Quiz ${i + 1}`,
            accuracy: Math.round((a.score / a.totalQuestions) * 100),
            subject: a.subject,
            date: a.createdAt,
        }));

        const bestSubject = subjectPerformance[0]?._id || "N/A";
        const weakSubject = subjectPerformance[subjectPerformance.length - 1]?._id || "N/A";
        const totalCorrect = allAttempts.reduce((s, a) => s + a.score, 0);
         const totalQuestions = allAttempts.reduce((s, a) => s + a.totalQuestions, 0);
        const avgTime = attempts.length ? Math.round(attempts.reduce((s, a) => s + (a.timeTaken || 0), 0) / attempts.length) : 0;

        res.json({
            success: true,
            analytics: {
    chartData,
    subjectPerformance,
    bestSubject,
    weakSubject,
    totalCorrect,
    totalQuestions,
    overallAccuracy: totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
    avgTime,
   totalAttempts: allAttempts.length,

    recentAttempts: attempts.map((attempt) => ({
        _id: attempt._id,
        quizTitle: attempt.quiz?.topic || attempt.subject,
        subject: attempt.subject,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        accuracy: attempt.totalQuestions
            ? Math.round((attempt.score / attempt.totalQuestions) * 100)
            : 0,
        timeTaken: attempt.timeTaken,
        completedAt: attempt.createdAt
    }))
}
        });
        } catch (error) {
        console.error("Quiz analytics error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load quiz analytics. Please try again later."
        });
    }
};

// Get quizzes created by all users.
const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find()
    .select("subject topic difficulty type questions createdBy createdAt")
    .populate("createdBy", "name")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

quizzes.forEach((quiz) => {
    quiz.questions = quiz.questions.map((question) => ({
        _id: question._id,
        question: question.question,
        options: question.options
    }));
});

        res.json({
            success: true,
            quizzes
        });

    } catch (error) {
        console.error("Get all quizzes error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load quizzes."
        });
    }
};

module.exports = {
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
};