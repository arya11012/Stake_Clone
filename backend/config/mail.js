const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true, // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false, // Helps bypass SSL issues
    },
});

const sendOtpMail = async (to, otp) => {
    console.log("SMTP Config:", {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS ? "****" : "MISSING",
    });

    const mailOptions = {
        from: process.env.SMTP_USER, // Ensure this matches SMTP_USER
        to,
        subject: "Your OTP for Email Verification",
        text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpMail };
