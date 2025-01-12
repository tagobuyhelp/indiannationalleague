import mongoose from 'mongoose';

const barcodeSchema = new mongoose.Schema({
    barcodeNumber: {
        type: String,
        required: true,
        unique: true
    },
    cloudinaryUrl: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Barcode = mongoose.model('Barcode', barcodeSchema);