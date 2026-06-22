const express = require("express");

const router = express.Router();


const {
    createNote,
    getNotes,
    getNote,
    updateNote,
    deleteNote,
    toggleImportant
} = require("../controllers/noteController");


const { protect } = require("../middleware/authMiddleware");


router.post(
    "/",
    protect,
    createNote
);


router.get(
    "/",
    protect,
    getNotes
);


router.get(
    "/:id",
    protect,
    getNote
);


router.put(
    "/:id",
    protect,
    updateNote
);


router.delete(
    "/:id",
    protect,
    deleteNote
);


router.patch(
    "/:id/important",
    protect,
    toggleImportant
);


module.exports = router;