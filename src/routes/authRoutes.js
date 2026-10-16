
const express = require("express");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const {
    registerUser,
    loginUser,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword
} = require("../controllers/authController");

// Limit repeated password-reset requests
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "Too many password-reset requests. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Limit repeated reset-token attempts
const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: "Too many reset attempts. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Limit OTP verification attempts
const verifyOTPLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: "Too many OTP verification requests. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Limit OTP resend requests
const resendOTPLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Too many OTP requests. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOTPLimiter, verifyOTP);
router.post("/resend-otp", resendOTPLimiter, resendOTP);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPasswordLimiter, resetPassword);

module.exports = router;
