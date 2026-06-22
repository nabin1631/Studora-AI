const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const taskRoutes = require("./routes/taskRoutes");
const { protect } = require("./middleware/authMiddleware");


const app = express();



// Rate Limit Security
const authLimiter = rateLimit({

    windowMs: 15 * 60 * 1000, // 15 minutes

    max: 50, // 50 requests per IP

    message:{
        success:false,
        message:"Too many requests, try again later"
    }

});



// Security Middleware
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials:true
    })
);



app.use(
    helmet({
        crossOriginResourcePolicy:false
    })
);



// Logger
app.use(
    morgan("dev")
);



// Body Parser
app.use(
    express.json()
);


app.use(
    express.urlencoded({
        extended:true
    })
);






// Test Route
app.get("/", (req,res)=>{

    res.status(200).json({

        success:true,

        message:"STUDORA AI Backend Running"

    });

});







// Authentication Routes
// Rate limiter added here
app.use(
    "/api/auth",
    authLimiter,
    authRoutes
);



// Notes Routes
app.use(
    "/api/notes",
    noteRoutes
);



// Tasks Routes
app.use(
    "/api/tasks",
    taskRoutes
);






// Protected Route
app.get(
    "/api/profile",
    protect,
    (req,res)=>{

        res.json({

            success:true,

            message:"Protected route accessed",

            user:req.user

        });

    }
);







// 404 Handler
app.use((req,res)=>{

    res.status(404).json({

        success:false,

        message:"Route Not Found"

    });

});





module.exports = app;