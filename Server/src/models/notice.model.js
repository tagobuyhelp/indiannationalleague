import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    recipients: [{
        type: String, // An array of email addresses to send the notice
        required: true
    }]
});

const Notice = mongoose.model('Notice', noticeSchema);

export { Notice };
