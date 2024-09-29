import mongoose, { Schema } from "mongoose";

const membershipSchema = new Schema({
    memberId: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    phone: {
        type: String,
        trim: true,
        index: true
    },

    transaction: {
        type: Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true
    },
    type: {
        type: String,
        required: true,
    },
    fee: {
        type: Number,
        required: true,
        min: 0
    },
    validity: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['inactive', 'active', 'expired'],
        default: 'inactive'
    }
}, { timestamps: true });

export const Membership = mongoose.model('Membership', membershipSchema);
