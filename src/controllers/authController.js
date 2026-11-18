const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");


// Generate JWT Token
const generateToken = (user) => {

    return jwt.sign(
        {
            id: user._id,
            tokenVersion: user.tokenVersion ?? 0
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE
        }
    );

};

// Generate OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString();
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






        res.status(201).json({

    success: true,

    message: "Registration successful. Please verify your email.",

    user: {
        id: user._id,
        name: user.name,
        email: user.email
    }

});



    }
   catch(error){

    console.error("Registration error:", error);

    res.status(500).json({
        success:false,
        message:"An internal server error occurred"
    });

}

};




// Login


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const match = await bcrypt.compare(
            password,
            user.password
        );

        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Security check: require email verification
        if (user.verified !== true) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in."
            });
        }

        // Generate JWT only after successful verification
        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            success: false,
            message: "An internal server error occurred"
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
// OTP Security Check
if (
    !otp ||
    !/^\d{6}$/.test(String(otp)) ||
    !user.otp ||
    !user.otpExpire ||
    user.otpExpire <= Date.now()
) {
    return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Request a new OTP."
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

// Generate token only after successful email verification
const token = generateToken(user);

res.json({
    success: true,
    message: "Email verified",
    token,
    user: {
        id: user._id,
        name: user.name,
        email: user.email,
        verified: user.verified
    }
});



    }
   catch(error){

    console.error("OTP verification error:", error);

    return res.status(500).json({
        success: false,
        message: "An internal server error occurred"
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

        if (user.verified) {
    return res.status(400).json({
        success: false,
        message: "Email is already verified. Please log in."
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

    console.error("Resend OTP error:", error);

    return res.status(500).json({
        success: false,
        message: "An internal server error occurred"
    });

}

};




// Forgot Password

const forgotPassword = async(req,res)=>{

    try{


        const {email}=req.body;


        const user =
        await User.findOne({email});



       if (!user) {
    return res.status(200).json({
        success: true,
        message: "If an account exists for this email, reset instructions will be sent."
    });
}

const token = crypto.randomBytes(32).toString("hex");

// Store only the SHA-256 hash of the reset token
    user.resetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");


user.resetTokenExpire = Date.now()+15*60*1000;
 await user.save();

 try {
    await sendEmail({
        email: user.email,
        subject: "STUDORA AI Password Reset",
        message: `
            Reset Token:
            ${token}
        `
    });
} catch (emailError) {

    // Remove the unused reset token if email delivery fails
    user.resetToken = null;
    user.resetTokenExpire = null;

    await user.save();

    throw emailError;
}




      res.status(200).json({
    success: true,
    message: "If an account exists for this email, reset instructions will be sent."
    });



    }
 catch(error){

    console.error("Forgot password error:", error);

    res.status(500).json({

        success:false,

        message:"An internal server error occurred"

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

        // Hash the token received from the reset link
      const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

       // Find user using the hashed token
         const user = await User.findOne({
    resetToken: hashedToken,
    resetTokenExpire: {
        $gt: Date.now()
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

// Invalidate all previously issued login tokens
user.tokenVersion = (user.tokenVersion ?? 0) + 1;

await user.save();



        res.json({

            success:true,

            message:"Password reset successful"

        });



    }
    catch(error){

    console.error("Password reset error:", error);

    return res.status(500).json({
        success: false,
        message: "An internal server error occurred"
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