const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(

{

    user:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },


    title:
    {
        type: String,
        required: true,
        trim: true
    },


    subject:
    {
        type: String,
        default: "General",
        trim: true
    },


    date:
    {
        type: Date,
        required: true
    },


    completed:
    {
        type: Boolean,
        default: false
    },


    priority:
    {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    }

},

{
    timestamps: true
}

);


module.exports = mongoose.model(
    "Task",
    TaskSchema
);