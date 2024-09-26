import mongoose, { Schema } from "mongoose";

const donationSchema = new mongoose.Schema({
    donorName: {
        type: String,
        required: true,
    },
    donorEmail: {
        type: String,
    },
    donorPhone: {
        type: String,
    },
    amount: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ["online", "bank transfer", "cash"],
    },
    paymentStatus: {
        type: String,
        enum: ["completed", "failed", "pending"],
        required: true,
    },
    purpose: {
        type: String,
    },
    transactionId: {
        type: String,
        required: true,
    },
    isAnonymous: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

export const Donation = mongoose.model('Donation', donationSchema);
