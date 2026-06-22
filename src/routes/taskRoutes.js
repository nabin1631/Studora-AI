const express = require("express");

const router = express.Router();


const {
    createTask,
    getTasks,
    updateTask,
    toggleComplete,
    deleteTask
} = require("../controllers/taskController");


const { protect } = require("../middleware/authMiddleware");


router.post(
    "/",
    protect,
    createTask
);


router.get(
    "/",
    protect,
    getTasks
);


router.put(
    "/:id",
    protect,
    updateTask
);


router.patch(
    "/:id/complete",
    protect,
    toggleComplete
);


router.delete(
    "/:id",
    protect,
    deleteTask
);


module.exports = router;