const Pdf = require("../models/Pdf");
const Groq = require("groq-sdk");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const PDF_SYSTEM_PROMPT = (pdfText) => `You are STUDORA AI, an intelligent PDF assistant.
You have been given the following PDF document content to analyze and answer questions about.

PDF CONTENT:
${pdfText.slice(0, 12000)}

Instructions:
- Answer questions based ONLY on the PDF content above.
- If the answer is not in the PDF, say "I couldn't find that information in this PDF."
- Be clear, concise, and educational.
- Use bullet points or numbered lists when appropriate.
- Quote relevant sections when helpful.`;


// Upload PDF and extract text
const uploadPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No PDF file uploaded"
            });
        }

        const filePath = req.file.path;

        // Extract text from PDF
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);

        if (!pdfData.text || pdfData.text.trim().length === 0) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
                success: false,
                message: "Could not extract text from this PDF. It may be image-based."
            });
        }

        // Save to database
        const pdf = await Pdf.create({
            user: req.user._id,
            fileName: req.file.filename,
            originalName: req.file.originalname,
            extractedText: pdfData.text,
            pageCount: pdfData.numpages,
            messages: []
        });

        // Delete file from server after extracting text
        fs.unlinkSync(filePath);

        res.status(201).json({
            success: true,
            pdf: {
                _id: pdf._id,
                originalName: pdf.originalName,
                pageCount: pdf.pageCount,
                createdAt: pdf.createdAt,
                messageCount: 0
            }
        });

    } catch (error) {
        console.error("PDF upload error:", error);
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: error.message || "Failed to process PDF"
        });
    }
};


// Get all PDFs for user
const getPdfs = async (req, res) => {
    try {
        const pdfs = await Pdf.find({
            user: req.user._id
        })
        .select("originalName pageCount createdAt messages")
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            pdfs: pdfs.map(p => ({
                _id: p._id,
                originalName: p.originalName,
                pageCount: p.pageCount,
                createdAt: p.createdAt,
                messageCount: p.messages.length
            }))
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Ask question about PDF
const askPdf = async (req, res) => {
    try {
        const { question } = req.body;
        const { id } = req.params;

        if (!question || !question.trim()) {
            return res.status(400).json({
                success: false,
                message: "Question is required"
            });
        }

        const pdf = await Pdf.findOne({
            _id: id,
            user: req.user._id
        });

        if (!pdf) {
            return res.status(404).json({
                success: false,
                message: "PDF not found"
            });
        }

        // Add user question
        pdf.messages.push({
            role: "user",
            content: question
        });

        // Build message history (last 6 messages)
        const recentMessages = pdf.messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content
        }));

        // Call Groq
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: PDF_SYSTEM_PROMPT(pdf.extractedText)
                },
                ...recentMessages
            ],
            temperature: 0.5,
            max_tokens: 1024
        });

        const aiReply = completion.choices[0].message.content;

        // Save AI response
        pdf.messages.push({
            role: "assistant",
            content: aiReply
        });

        await pdf.save();

        res.json({
            success: true,
            reply: aiReply,
            pdfId: pdf._id
        });

    } catch (error) {
        console.error("PDF ask error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "AI service error"
        });
    }
};


// Get single PDF with messages
const getPdf = async (req, res) => {
    try {
        const pdf = await Pdf.findOne({
            _id: req.params.id,
            user: req.user._id
        }).select("-extractedText");

        if (!pdf) {
            return res.status(404).json({
                success: false,
                message: "PDF not found"
            });
        }

        res.json({
            success: true,
            pdf
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Delete PDF
const deletePdf = async (req, res) => {
    try {
        const pdf = await Pdf.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!pdf) {
            return res.status(404).json({
                success: false,
                message: "PDF not found"
            });
        }

        await pdf.deleteOne();

        res.json({
            success: true,
            message: "PDF deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Summarize PDF
const summarizePdf = async (req, res) => {
    try {
        const pdf = await Pdf.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!pdf) {
            return res.status(404).json({
                success: false,
                message: "PDF not found"
            });
        }

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are STUDORA AI. Summarize the following PDF document clearly and concisely.
                    Include: main topics, key points, and important concepts.
                    Format with clear sections and bullet points.`
                },
                {
                    role: "user",
                    content: `Please summarize this document:\n\n${pdf.extractedText.slice(0, 12000)}`
                }
            ],
            temperature: 0.5,
            max_tokens: 1500
        });

        const summary = completion.choices[0].message.content;

        // Save summary as a message
        pdf.messages.push({ role: "user", content: "Summarize this PDF" });
        pdf.messages.push({ role: "assistant", content: summary });
        await pdf.save();

        res.json({
            success: true,
            summary
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    uploadPdf,
    getPdfs,
    getPdf,
    askPdf,
    deletePdf,
    summarizePdf
};