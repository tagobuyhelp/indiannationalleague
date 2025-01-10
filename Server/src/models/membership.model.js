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
        min: 0,
        default: 36 // 3 years in months
    },
    status: {
        type: String,
        enum: ['inactive', 'active', 'expired', 'canceled'],
        default: 'inactive'
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        required: true
    },
    lastRenewalDate: {
        type: Date
    },
    renewalCount: {
        type: Number,
        default: 0
    },
    cancellationDate: {
        type: Date
    },
    cancellationReason: {
        type: String
    }
}, { timestamps: true });

// Pre-save hook to calculate expiryDate
membershipSchema.pre('save', function(next) {
    if (this.isNew || this.isModified('startDate') || this.isModified('validity')) {
        const expiryDate = new Date(this.startDate);
        expiryDate.setMonth(expiryDate.getMonth() + this.validity);
        this.expiryDate = expiryDate;
    }
    next();
});

export const Membership = mongoose.model('Membership', membershipSchema);