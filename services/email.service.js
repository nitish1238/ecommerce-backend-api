
import transporter from "../config/email.js";

const sendEmail = async ({ to, subject, html }) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        });

        return info;

    } catch (error) {
        console.error("Email sending error:", error);
        throw new Error("Unable to send email");
    }
};

export default sendEmail;
