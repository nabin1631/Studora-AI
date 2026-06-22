const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(

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


    content:
    {
        type: String,
        default: ""
    },


    subject:
    {
        type: String,
        default: "General",
        trim: true
    },


    isImportant:
    {
        type: Boolean,
        default: false
    },


    tags:
    [
        {
            type: String,
            trim: true
        }
    ]

},

{
    timestamps: true
}

);


module.exports = mongoose.model(
    "Note",
    NoteSchema
);