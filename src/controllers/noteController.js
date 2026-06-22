const Note = require("../models/Note");


// Create note
const createNote = async (req, res) => {

    try {

        const { title, content, subject, tags } = req.body;


        if(!title)
        {
            return res.status(400).json({
                success: false,
                message: "Title is required"
            });
        }


        const note = await Note.create({

            user: req.user._id,

            title,

            content: content || "",

            subject: subject || "General",

            tags: tags || []

        });


        res.status(201).json({

            success: true,

            note

        });


    }
    catch(error)
    {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

};



// Get all notes for logged-in user
const getNotes = async (req, res) => {

    try {

        const notes = await Note.find({
            user: req.user._id
        }).sort({
            isImportant: -1,
            updatedAt: -1
        });


        res.json({
            success: true,
            count: notes.length,
            notes
        });


    }
    catch(error)
    {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

};



// Get single note
const getNote = async (req, res) => {

    try {

        const note = await Note.findOne({
            _id: req.params.id,
            user: req.user._id
        });


        if(!note)
        {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }


        res.json({
            success: true,
            note
        });


    }
    catch(error)
    {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

};



// Update note
const updateNote = async (req, res) => {

    try {

        const note = await Note.findOne({
            _id: req.params.id,
            user: req.user._id
        });


        if(!note)
        {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }


        const { title, content, subject, tags, isImportant } = req.body;


        if(title !== undefined) note.title = title;
        if(content !== undefined) note.content = content;
        if(subject !== undefined) note.subject = subject;
        if(tags !== undefined) note.tags = tags;
        if(isImportant !== undefined) note.isImportant = isImportant;


        await note.save();


        res.json({
            success: true,
            note
        });


    }
    catch(error)
    {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

};



// Delete note
const deleteNote = async (req, res) => {

    try {

        const note = await Note.findOne({
            _id: req.params.id,
            user: req.user._id
        });


        if(!note)
        {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }


        await note.deleteOne();


        res.json({
            success: true,
            message: "Note deleted successfully"
        });


    }
    catch(error)
    {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

};



// Toggle important flag
const toggleImportant = async (req, res) => {

    try {

        const note = await Note.findOne({
            _id: req.params.id,
            user: req.user._id
        });


        if(!note)
        {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }


        note.isImportant = !note.isImportant;

        await note.save();


        res.json({
            success: true,
            note
        });


    }
    catch(error)
    {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

};




module.exports = {

    createNote,

    getNotes,

    getNote,

    updateNote,

    deleteNote,

    toggleImportant

};