const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");


// Generate JWT Token
const generateToken = (id) => {

    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE
        }
    );

};


// Generate OTP
const generateOTP = () => {

    return Math.floor(
        100000 + Math.random() * 900000
    ).toString();

};



// Register User
const registerUser = async (req,res)=>{

    try {

        const {
            name,
            email,
            password
        } = req.body;


        if(!name || !email || !password)
        {
            return res.status(400).json({
                success:false,
                message:"Please fill all fields"
            });
        }
       
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

        if(!passwordRegex.test(password))
        {
            return res.status(400).json({
                success:false,
                message:"Password must be at least 8 characters and include a letter, a number, and a special character (@$!%*#?&)"
            });
        }

        const existingUser =
        await User.findOne({email});


        if(existingUser)
        {
            return res.status(400).json({
                success:false,
                message:"User already exists"
            });
        }



        const salt =
        await bcrypt.genSalt(10);


        const hashedPassword =
        await bcrypt.hash(password,salt);



        const otp = generateOTP();



        const user =
        await User.create({

            name,

            email,

            password:hashedPassword,

            verified:false,

            
            otp,
            otpAttempts:0,


            otpExpire:
            Date.now() + 10 * 60 * 1000

        });



        await sendEmail({

            email:user.email,

            subject:"STUDORA AI Email Verification",

            message:
            `
            <h2>STUDORA AI</h2>
            <p>Your OTP:</p>
            <h1>${otp}</h1>
            `

        });



        const token =
        generateToken(user._id);



        res.status(201).json({

            success:true,

            message:"Registration successful",

            token,

            user:{
                id:user._id,
                name:user.name,
                email:user.email
            }

        });



    }
    catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};




// Login

const loginUser = async(req,res)=>{

    try{

        const {
            email,
            password
        } = req.body;



        const user =
        await User.findOne({email});


        if(!user)
        {
            return res.status(401).json({
                success:false,
                message:"Invalid email or password"
            });
        }



        const match =
        await bcrypt.compare(
            password,
            user.password
        );


        if(!match)
        {
            return res.status(401).json({
                success:false,
                message:"Invalid email or password"
            });
        }



        const token =
        generateToken(user._id);



        res.json({

            success:true,

            message:"Login successful",

            token,

            user:{
                id:user._id,
                name:user.name,
                email:user.email
            }

        });


    }
    catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};




// Verify OTP (UPDATED)

const verifyOTP = async(req,res)=>{

    try{

        const {
            email,
            otp
        } = req.body;



        const user =
        await User.findOne({email});



        if(!user)
        {
            return res.status(404).json({

                success:false,

                message:"User not found"

            });
        }




        // OTP Security Check
        // OTP Expired
if(user.otpExpire < Date.now())
{
    return res.status(400).json({

        success:false,

        message:"OTP expired"

    });
}


// Too many attempts
if(user.otpAttempts >= 5)
{
    return res.status(429).json({

        success:false,

        message:"Too many OTP attempts. Request a new OTP"

    });
}


// Wrong OTP
if(user.otp !== otp)
{
    user.otpAttempts += 1;

    await user.save();

    return res.status(400).json({

        success:false,

        message:"Invalid OTP"

    });
}





        user.verified = true;

user.otp = null;

user.otpExpire = null;

user.otpAttempts = 0;



        await user.save();




        res.json({

            success:true,

            message:"Email verified"

        });



    }
    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};




// Resend OTP

const resendOTP = async(req,res)=>{

    try{


        const {email}=req.body;


        const user =
        await User.findOne({email});



        if(!user)
        {
            return res.status(404).json({
                success:false,
                message:"User not found"
            });
        }



        const otp =
        generateOTP();



        user.otp = otp;

user.otpAttempts = 0;

user.otpExpire =
Date.now()+10*60*1000;



        await user.save();




        await sendEmail({

            email:user.email,

            subject:"STUDORA AI New OTP",

            message:
            `<h1>${otp}</h1>`

        });



        res.json({

            success:true,

            message:"OTP sent"

        });



    }
    catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};




// Forgot Password

const forgotPassword = async(req,res)=>{

    try{


        const {email}=req.body;


        const user =
        await User.findOne({email});



        if(!user)
        {
            return res.status(404).json({

                success:false,

                message:"User not found"

            });
        }




        const token =
        crypto.randomBytes(32)
        .toString("hex");



        user.resetToken = token;


        user.resetTokenExpire =
        Date.now()+15*60*1000;



        await user.save();




        await sendEmail({

            email:user.email,

            subject:"STUDORA AI Password Reset",

            message:
            `
            Reset Token:
            ${token}
            `

        });




        res.json({

            success:true,

            message:"Reset email sent"

        });



    }
    catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};




// Reset Password

const resetPassword = async(req,res)=>{

    try{


        const {
            token,
            password
        } = req.body;



        if(!token || !password)
        {
            return res.status(400).json({

                success:false,

                message:"Token and password required"

            });
        }

       const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

        if(!passwordRegex.test(password))
        {
            return res.status(400).json({

                success:false,

                message:"Password must be at least 8 characters and include a letter, a number, and a special character (@$!%*#?&)"

            });
        }

        const user =
        await User.findOne({

            resetToken:token,

            resetTokenExpire:{
                $gt:Date.now()
            }

        });



        if(!user)
        {
            return res.status(400).json({

                success:false,

                message:"Invalid or expired token"

            });
        }




        const salt =
        await bcrypt.genSalt(10);



        user.password =
        await bcrypt.hash(
            password,
            salt
        );



        user.resetToken = null;

        user.resetTokenExpire = null;



        await user.save();




        res.json({

            success:true,

            message:"Password reset successful"

        });



    }
    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};




module.exports = {

    registerUser,

    loginUser,

    verifyOTP,

    resendOTP,

    forgotPassword,

    resetPassword

};