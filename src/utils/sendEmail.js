const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
    const { data, error } = await resend.emails.send({
        from: "Studora AI <onboarding@resend.dev>",
        to: options.email,
        subject: options.subject,
        html: options.message
    });

    if (error) {
        console.error("RESEND EMAIL ERROR:", error);
        throw new Error(error.message || "Failed to send email");
    }

    console.log("RESEND EMAIL SENT:", data);

    return data;
};

module.exports = sendEmail;