const Chat = require("../models/Chat");
const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are STUDORA AI, a friendly and intelligent personal study tutor. 
You help students understand concepts clearly, solve problems step by step, and prepare for exams.
Keep responses clear, concise, and educational. Use examples where helpful.
Format your responses with proper structure — use bullet points, numbered steps, or headers when appropriate.
Always encourage the student and make learning feel achievable.`;


// Send a message and get AI response
const sendMessage = async (req, res) => {
    try {
        const { message, chatId } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        let chat;

        if (chatId) {
            chat = await Chat.findOne({
                _id: chatId,
                user: req.user._id
            });
            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: "Chat not found"
                });
            }
        } else {
            chat = await Chat.create({
                user: req.user._id,
                title: message.slice(0, 50),
                messages: []
            });
        }

        // Add user message
        chat.messages.push({
            role: "user",
            content: message
        });

        // Call Groq API
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT,
                },
                ...chat.messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                })),
            ],
            temperature: 0.7,
            max_tokens: 1024,
        });

        const aiReply = completion.choices[0].message.content;

        // Add AI response to chat
        chat.messages.push({
            role: "assistant",
            content: aiReply
        });

        // Update chat title from first message if new chat
        if (chat.messages.length === 2) {
            chat.title = message.slice(0, 60);
        }

        await chat.save();

        res.json({
            success: true,
            reply: aiReply,
            chatId: chat._id,
            chat
        });

    } catch (error) {
    console.error("Groq Error:", error);

    return res.status(500).json({
        success: false,
        message: "AI service is temporarily unavailable. Please try again later."
    });
}
};


// Get all chats for user
const getChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            user: req.user._id
        })
        .select("title createdAt updatedAt messages")
        .sort({ updatedAt: -1 });

        res.json({
            success: true,
            chats
        });
    } catch (error) {
    console.error("Chat history error:", error);

    return res.status(500).json({
        success: false,
        message: "An internal server error occurred"
    });
}
};


// Get single chat
const getChat = async (req, res) => {
    try {
        const chat = await Chat.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        res.json({
            success: true,
            chat
        });
   } catch (error) {
    console.error("Get chat error:", error);

    return res.status(500).json({
        success: false,
        message: "An internal server error occurred"
    });
}
};


// Delete chat
const deleteChat = async (req, res) => {
    try {
        const chat = await Chat.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        await chat.deleteOne();

        res.json({
            success: true,
            message: "Chat deleted"
        });
    } catch (error) {
    console.error("Delete chat error:", error);

    return res.status(500).json({
        success: false,
        message: "An internal server error occurred"
    });
}
};


module.exports = {
    sendMessage,
    getChats,
    getChat,
    deleteChat
};