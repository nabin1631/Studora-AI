const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
    uploadPdf,
    getPdfs,
    getPdf,
    askPdf,
    deletePdf,
    summarizePdf
} = require("../controllers/pdfController");

const { protect } = require("../middleware/authMiddleware");

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});


router.post("/upload", protect, upload.single("pdf"), uploadPdf);
router.get("/", protect, getPdfs);
router.get("/:id", protect, getPdf);
router.post("/:id/ask", protect, askPdf);
router.post("/:id/summarize", protect, summarizePdf);
router.delete("/:id", protect, deletePdf);

module.exports = router;