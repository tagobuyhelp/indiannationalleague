import mongoose from 'mongoose';

// Define the schema for the barcode
const barcodeSchema = new mongoose.Schema({
    barcodeNumber: { type: String, required: true, unique: true }, // Barcode number (e.g., 123456789)
    filePath: { type: String, required: true },                   // File path where the barcode is saved (e.g., '/barcodes/barcode_123456789.png')
    createdAt: { type: Date, default: Date.now },                  // Timestamp of when the barcode was created
});

// Create the Barcode model from the schema
const Barcode = mongoose.model('Barcode', barcodeSchema);

export { Barcode };
