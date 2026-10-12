const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY
});

const sendEmail = async (options) => {
    try {
        const result = await brevo.transactionalEmails.sendTransacEmail({
            subject: options.subject,

            htmlContent: options.message,

            sender: {
                name: "Studora AI",
                email: process.env.BREVO_SENDER_EMAIL
            },

            to: [
                {
                    email: options.email
                }
            ]
        });

        console.log("BREVO EMAIL SENT:", result);

        return result;

    } catch (error) {
        console.error(
            "BREVO EMAIL ERROR:",
            error.body || error.message || error
        );

        throw new Error("Failed to send email");
    }
};

module.exports = sendEmail;