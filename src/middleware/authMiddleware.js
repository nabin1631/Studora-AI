const jwt = require("jsonwebtoken");
const User = require("../models/User");



// Protect Routes
const protect = async (req,res,next)=>{

    try{


        let token;



        // Check Authorization header
        if(
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ){

            token =
            req.headers.authorization.split(" ")[1];

        }



        if(!token)
        {
            return res.status(401).json({

                success:false,

                message:"Not authorized, no token"

            });
        }




        // Verify token
        const decoded =
        jwt.verify(
            token,
            process.env.JWT_SECRET
        );




        // Find user
        req.user =
        await User.findById(decoded.id)
        .select("-password");



if (!req.user) {
    return res.status(401).json({
        success: false,
        message: "User not found"
    });
}
// Check token version to invalidate old sessions
const currentTokenVersion = req.user.tokenVersion ?? 0;
const tokenVersionFromJwt = decoded.tokenVersion ?? 0;

if (tokenVersionFromJwt !== currentTokenVersion) {
    return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again."
    });
}

// Block users whose email is not verified
if (req.user.verified !== true) {
    return res.status(403).json({
        success: false,
        message: "Please verify your email to access this resource."
    });
}

next();




    }
    catch(error)
    {

        return res.status(401).json({

            success:false,

            message:"Token invalid or expired"

        });

    }


};




module.exports = {
    protect
};