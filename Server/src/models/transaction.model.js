import mongoose, { Schema } from "mongoose";

const transactionSchema = new mongoose.Schema({
    memberId: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },
    transactionType: {
        type: String,
        enum: ['donation', 'membershipFees','membershipRenewal' ],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ["completed", "failed", "pending"],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    }
}, { timestamps: true });

export const Transaction = mongoose.model('Transaction', transactionSchema);
