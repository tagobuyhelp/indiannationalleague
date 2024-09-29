import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true, // true for port 465, false for other ports
    auth: {
        user: "info@indiannationalleague.party",
        pass: "inl#Web@2024",
    },
});

export default transporter;
