import mongoose, { Schema } from "mongoose";
import { generateTnxId } from "../utils/generateId.js";

const transactionSchema = new mongoose.Schema({
    memberId: {
        type: String,
    },
    transactionId: {
        type: String,
        default: generateTnxId(),
        required: true,
    },
    transactionType: {
        type: String,
        enum: ['donation', 'membershipFees'], 
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
    }

}, {timestamps: true});





export const Transaction = mongoose.model('Transaction',transactionSchema);