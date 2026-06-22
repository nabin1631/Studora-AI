const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers([
    "1.1.1.1",
    "1.0.0.1"
]);

const connectDB = async () => {
    try {

        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB Connected Successfully");

    } catch (error) {

        console.error(
            "MongoDB Connection Failed:",
            error.message
        );

        process.exit(1);
    }
};

module.exports = connectDB;