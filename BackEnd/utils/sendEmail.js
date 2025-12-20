import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@studymate.com',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: options.html // Optional: Add HTML support if needed
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmail;
