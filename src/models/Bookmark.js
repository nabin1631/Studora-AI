const mongoose = require("mongoose");

const BookmarkSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: String, required: true },
    options: [String],
    answer: { type: String, required: true },
    explanation: { type: String, default: "" },
    subject: { type: String, required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
}, { timestamps: true });

module.exports = mongoose.model("Bookmark", BookmarkSchema);