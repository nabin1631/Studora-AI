const mongoose = require("mongoose");

const QuizAttemptSchema = new mongoose.Schema(
{
    user:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    quiz:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
        required: true
    },

    subject:
    {
        type: String,
        required: true
    },

    answers:
    [
        {
            questionIndex: Number,
            selectedAnswer: String,
            correct: Boolean,
            timeTaken: Number
        }
    ],

    score:
    {
        type: Number,
        default: 0
    },

    totalQuestions:
    {
        type: Number,
        required: true
    },

    pointsEarned:
    {
        type: Number,
        default: 0
    },

    timeTaken:
    {
        type: Number,
        default: 0
    },

    completed:
    {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model("QuizAttempt", QuizAttemptSchema);