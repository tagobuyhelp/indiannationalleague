import mongoose, { Schema } from "mongoose";

const memberSchema = new Schema({
    memberId: {
        type: String,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    aadhaar: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{12}$/.test(v);
            },
            message: props => `${props.value} is not a valid Aadhaar number!`
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        match: /.+\@.+\..+/,
    },
    dob: {
        type: Date,
        required: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    state: {
        type: String,
        required: true,
        trim: true,
    },
    pinCode: {
        type: String,
        required: true,
        trim: true,
        match: /^[1-9][0-9]{5}$/,
    },
    district: {
        type: String,
        required: true,
        trim: true,
    },
    parliamentConstituency: {
        type: String,
        required: true,
        trim: true,
    },
    assemblyConstituency: {
        type: String,
        required: true,
        trim: true,
    },
    panchayat: {
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
        enum: ['general', 'active'],
    },
    photo: {
        type: String,
        trim: true,
    },
    idCard: {
        type: String,
        trim: true,
    }
}, { timestamps: true });

export const Member = mongoose.model('Member', memberSchema);
