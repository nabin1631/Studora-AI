const Task = require("../models/Task");


// Create task
const createTask = async (req, res) => {

    try {

        const { title, subject, date, priority } = req.body;


        if(!title || !date)
        {
            return res.status(400).json({
                success: false,
                message: "Title and date are required"
            });
        }


        const task = await Task.create({

            user: req.user._id,

            title,

            subject: subject || "General",

            date,

            priority: priority || "medium"

        });


        res.status(201).json({
            success: true,
            task
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



// Get all tasks for logged-in user
const getTasks = async (req, res) => {

    try {

        const tasks = await Task.find({
            user: req.user._id
        }).sort({
            date: 1
        });


        res.json({
            success: true,
            count: tasks.length,
            tasks
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



// Update task
const updateTask = async (req, res) => {

    try {

        const task = await Task.findOne({
            _id: req.params.id,
            user: req.user._id
        });


        if(!task)
        {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }


        const { title, subject, date, priority, completed } = req.body;


        if(title !== undefined) task.title = title;
        if(subject !== undefined) task.subject = subject;
        if(date !== undefined) task.date = date;
        if(priority !== undefined) task.priority = priority;
        if(completed !== undefined) task.completed = completed;


        await task.save();


        res.json({
            success: true,
            task
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



// Toggle task completed
const toggleComplete = async (req, res) => {

    try {

        const task = await Task.findOne({
            _id: req.params.id,
            user: req.user._id
        });


        if(!task)
        {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }


        task.completed = !task.completed;

        await task.save();


        res.json({
            success: true,
            task
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



// Delete task
const deleteTask = async (req, res) => {

    try {

        const task = await Task.findOne({
            _id: req.params.id,
            user: req.user._id
        });


        if(!task)
        {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }


        await task.deleteOne();


        res.json({
            success: true,
            message: "Task deleted successfully"
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

    createTask,

    getTasks,

    updateTask,

    toggleComplete,

    deleteTask

};