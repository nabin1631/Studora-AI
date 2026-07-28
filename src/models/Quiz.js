const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String }],
    answer: { type: String, required: true },
    explanation: { type: String, default: "" }
});

const QuizSchema = new mongoose.Schema(
{
    createdBy:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    subject:
    {
        type: String,
        required: true
    },

    topic:
    {
        type: String,
        default: ""
    },

    difficulty:
    {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium"
    },

    questions:
    [
        QuestionSchema
    ],

    type:
    {
        type: String,
        enum: ["ai-generated", "practice"],
        default: "ai-generated"
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model("Quiz", QuizSchema);