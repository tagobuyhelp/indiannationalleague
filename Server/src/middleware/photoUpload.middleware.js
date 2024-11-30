import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define the directory for saving photos
const photoDirectory = path.resolve('images/photos');

// Ensure the directory exists
if (!fs.existsSync(photoDirectory)) {
    fs.mkdirSync(photoDirectory, { recursive: true });
}

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, photoDirectory); // Save files in the photos directory
    },
    filename: (req, file, cb) => {
        // Generate a unique name based on timestamp and original file extension
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// Set up multer middleware with the defined storage and file filter
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Allow only image files (jpg, jpeg, png, gif)
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5 MB
});

// Middleware to handle a single file upload under the field name 'photo'
export const uploadPhoto = upload.single('photo');

// Function to construct a valid photo URL or relative path
export const getPhotoPath = (filename) => {
    return `images/photos/${filename}`; // Adjust to your desired path handling logic
};
