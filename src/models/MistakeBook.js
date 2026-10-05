const mongoose = require("mongoose");

const MistakeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: String, required: true },
    options: [String],
    answer: { type: String, required: true },
    explanation: { type: String, default: "" },
    subject: { type: String, required: true },
    userAnswer: { type: String, default: "" },
    reviewedCount: { type: Number, default: 0 },
    mastered: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("MistakeBook", MistakeSchema);