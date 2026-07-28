const mongoose = require("mongoose");

const PdfSchema = new mongoose.Schema(
{
    user:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    fileName:
    {
        type: String,
        required: true
    },

    originalName:
    {
        type: String,
        required: true
    },

    extractedText:
    {
        type: String,
        required: true
    },

    pageCount:
    {
        type: Number,
        default: 0
    },

    messages:
    [
        {
            role:
            {
                type: String,
                enum: ["user", "assistant"],
                required: true
            },
            content:
            {
                type: String,
                required: true
            },
            createdAt:
            {
                type: Date,
                default: Date.now
            }
        }
    ]
},
{
    timestamps: true
}
);

module.exports = mongoose.model("Pdf", PdfSchema);