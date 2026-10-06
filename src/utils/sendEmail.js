const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
    await resend.emails.send({
        from: "Studora AI <onboarding@resend.dev>",
        to: options.email,
        subject: options.subject,
        html: options.message
    });
};

module.exports = sendEmail;