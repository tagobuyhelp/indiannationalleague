import mongoose, { Schema } from "mongoose";

const memberSchema = new Schema({
    fullname: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    membershipStatus: {
        type: String,
        required: true,
        trim: true,
        default: "inactive",
        enum: ['inactive', 'active', 'expired'],
    },
    membershipType: {
        type: String,
        required: true,
        trim: true,
        enum: ['standard', 'premium', 'VIP'],
    }
}, { timestamps: true });

export const Member = mongoose.model('Member', memberSchema);
