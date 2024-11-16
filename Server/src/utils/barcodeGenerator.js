import { Barcode } from '../models/barcode.model.js';
import bwipjs from 'bwip-js';
import path from 'path';
import { writeFile } from 'fs/promises';

/**
 * Generate a barcode and save the barcode number and file path in the database.
 * @param {string} text - The text to encode in the barcode (e.g., member ID).
 * @param {string} directory - The directory where the barcode image will be saved.
 * @returns {Promise<void>}
 */
export const generateAndSaveBarcode = async (text) => {
    try {
        // Construct the filename based on the barcode text (e.g., "barcode_123456789.png")
        const fileName = `barcode_${text}.png`;
        const filePath = path.join('./images/barcodes', fileName);

        const pngBuffer = await bwipjs.toBuffer({
            bcid: 'code128',         // Barcode type (code128, qrcode, etc.)
            text: text,              // Text to encode
            scale: 3,                // Scaling factor
            height: 10,              // Barcode height in millimeters
            includetext: false,      // Omit the text below the barcode
        });

        // Write the barcode image to a file with the dynamic filename
        await writeFile(filePath, pngBuffer);

        // Create a new Barcode document to save the barcode number and file path
        const newBarcode = new Barcode({
            barcodeNumber: text,    // Store the barcode number
            filePath: filePath,     // Store the file path where the barcode is saved
        });

        // Save the barcode document to the database
        await newBarcode.save();

        console.log(`Barcode image saved at ${filePath} and record saved in the database.`);
    } catch (error) {
        console.error('Failed to generate and save barcode:', error);
    }
};

/**
 * Find a barcode by its number.
 * @param {string} barcodeNumber - The barcode number to search for.
 * @returns {Promise<Barcode | null>} - The found barcode document or null if not found.
 */
export const findBarcodeByNumber = async (barcodeNumber) => {
    try {
        const barcode = await Barcode.findOne({ barcodeNumber });
        if (barcode) {
            console.log(`Barcode found: ${barcode.barcodeNumber}, File Path: ${barcode.filePath}`);
            return barcode;
        } else {
            console.log('Barcode not found');
            return null;
        }
    } catch (error) {
        console.error('Failed to find barcode:', error);
    }
};

/**
 * Update a barcode's file path by its barcode number.
 * @param {string} barcodeNumber - The barcode number to update.
 * @param {string} newFilePath - The new file path to save for the barcode.
 * @returns {Promise<Barcode | null>} - The updated barcode document or null if not found.
 */
export const updateBarcode = async (barcodeNumber, newFilePath) => {
    try {
        const updatedBarcode = await Barcode.findOneAndUpdate(
            { barcodeNumber },
            { filePath: newFilePath },  // Update the file path
            { new: true }  // Return the updated document
        );

        if (updatedBarcode) {
            console.log(`Barcode updated: ${updatedBarcode.barcodeNumber}, New File Path: ${updatedBarcode.filePath}`);
            return updatedBarcode;
        } else {
            console.log('Barcode not found');
            return null;
        }
    } catch (error) {
        console.error('Failed to update barcode:', error);
    }
};

/**
 * Delete a barcode by its number.
 * @param {string} barcodeNumber - The barcode number to delete.
 * @returns {Promise<void>}
 */
export const deleteBarcode = async (barcodeNumber) => {
    try {
        const deletedBarcode = await Barcode.findOneAndDelete({ barcodeNumber });

        if (deletedBarcode) {
            console.log(`Barcode deleted: ${deletedBarcode.barcodeNumber}`);
        } else {
            console.log('Barcode not found');
        }
    } catch (error) {
        console.error('Failed to delete barcode:', error);
    }
};
