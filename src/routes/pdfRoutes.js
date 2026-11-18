const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
    uploadPdf,
    getPdfs,
    getPdf,
    askPdf,
    deletePdf,
    summarizePdf
} = require("../controllers/pdfController");

const { protect } = require("../middleware/authMiddleware");
const rateLimit = require("express-rate-limit");

// Temporary test: Limit AI requests to 2 per user every 15 minutes
const pdfAiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user._id.toString(),
    message: {
        success: false,
        message: "Too many AI requests. Please try again after 15 minutes."
    }
});

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
    cb(null, uploadDir);
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
router.post("/:id/ask", protect, pdfAiLimiter, askPdf);
router.post("/:id/summarize", protect, pdfAiLimiter, summarizePdf);
router.delete("/:id", protect, deletePdf);

module.exports = router;