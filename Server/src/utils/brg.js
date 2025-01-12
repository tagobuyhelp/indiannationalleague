import bwipjs from 'bwip-js';
import cloudinary from '../utils/cloudinaryConfig.js';
import { Barcode } from '../models/barcode.model.js';

export const generateAndSaveBarcode = async (barcodeNumber) => {
    try {
        const png = await bwipjs.toBuffer({
            bcid: 'code128',
            text: barcodeNumber,
            scale: 3,  
            height: 10, 
            includetext: false,
        });

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'inl_barcodes' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(png);
        });

        // Check if a barcode with this number already exists
        let barcode = await Barcode.findOne({ barcodeNumber });

        if (barcode) {
            // If it exists, update the cloudinaryUrl
            barcode.cloudinaryUrl = result.secure_url;
            await barcode.save();
            console.log(`Updated existing barcode: ${barcodeNumber}`);
        } else {
            // If it doesn't exist, create a new one
            barcode = new Barcode({
                barcodeNumber,
                cloudinaryUrl: result.secure_url,
            });
            await barcode.save();
            console.log(`Created new barcode: ${barcodeNumber}`);
        }

        return result.secure_url;
    } catch (error) {
        console.error('Failed to generate and save barcode:', error);
        throw error;
    }
};

export const findBarcodeByNumber = async (barcodeNumber) => {
    try {
        const barcode = await Barcode.findOne({ barcodeNumber });
        return barcode ? barcode.cloudinaryUrl : null;
    } catch (error) {
        console.error('Failed to find barcode:', error);
        throw error;
    }
};

export const updateBarcode = async (barcodeNumber, newCloudinaryUrl) => {
    try {
        const updatedBarcode = await Barcode.findOneAndUpdate(
            { barcodeNumber },
            { cloudinaryUrl: newCloudinaryUrl },
            { new: true }
        );

        if (updatedBarcode) {
            console.log(`Barcode updated: ${updatedBarcode.barcodeNumber}, New Cloudinary URL: ${updatedBarcode.cloudinaryUrl}`);
            return updatedBarcode;
        } else {
            console.log('Barcode not found');
            return null;
        }
    } catch (error) {
        console.error('Failed to update barcode:', error);
        throw error;
    }
};

export const deleteBarcode = async (barcodeNumber) => {
    try {
        const deletedBarcode = await Barcode.findOneAndDelete({ barcodeNumber });

        if (deletedBarcode) {
            // Optionally, delete the image from Cloudinary
            await cloudinary.uploader.destroy(deletedBarcode.cloudinaryUrl.split('/').pop().split('.')[0]);
            console.log(`Barcode deleted: ${deletedBarcode.barcodeNumber}`);
        } else {
            console.log('Barcode not found');
        }
    } catch (error) {
        console.error('Failed to delete barcode:', error);
        throw error;
    }
};