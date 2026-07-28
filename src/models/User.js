const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
{
    name:
    {
        type:String,
        required:true,
        trim:true
    },

    email:
    {
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },

    password:
    {
        type:String,
        required:true,
        minlength:8
    },

    verified:
    {
        type:Boolean,
        default:false
    },

    otp:
    {
        type:String,
        default:null
    },
     
    otpAttempts:
    {
        type:Number,
        default:0
    },

    otpExpire:
    {
        type:Date,
        default:null
    },

    avatar:
    {
        type:String,
        default:""
    },

    role:
    {
        type:String,
        default:"user"
    },

    resetToken:
    {
        type:String,
        default:null
    },

    resetTokenExpire:
    {
        type:Date,
        default:null
    },

    createdAt:
    {
        type:Date,
        default:Date.now
    },

    points:
    {
        type: Number,
        default: 0
    },

    level:
    {
        type: Number,
        default: 1
    },

    streak:
    {
        type: Number,
        default: 0
    },

    lastQuizDate:
    {
        type: Date,
        default: null
    },

    badges:
    {
        type: [String],
        default: []
    },

    totalQuizzes:
    {
        type: Number,
        default: 0
    },

    totalCorrect:
    {
        type: Number,
        default: 0
    }
}
);

module.exports = mongoose.model(
    "User",
    UserSchema
);