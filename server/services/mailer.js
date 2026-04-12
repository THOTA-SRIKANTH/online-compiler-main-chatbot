import nodemailer from 'nodemailer';

const sendMail = (to, subject, text) => {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Failed to send mail", error);
                resolve(0); // Resolve with 0 instead of rejecting to prevent registration failure
            } else {
                console.log("Mail sent", info);
                resolve(1);
            }
        });
    });
};
export default sendMail;