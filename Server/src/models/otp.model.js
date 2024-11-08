import mongoose, { Schema } from 'mongoose';

const otpSchema = new Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '5m' }, // Expires in 5 minutes
});

export const OtpCode = mongoose.model('OtpCode', otpSchema);
