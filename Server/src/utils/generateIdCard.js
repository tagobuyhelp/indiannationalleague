import { createCanvas, loadImage } from 'canvas';
import { writeFile } from 'fs/promises';

// Create a canvas for the portrait ID card (400x600 pixels for higher resolution)
const canvas = createCanvas(400, 600);
const ctx = canvas.getContext('2d');

// Function to draw a rounded rectangle
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.clip();  // Set the clipping region for the rounded rectangle
}

// Background color (White)
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(0, 0, 400, 600);

// Use brand color for text (Dark Gray: #333333)
ctx.fillStyle = '#006600'; // Branding "INL" Logo

// Branding text at the top left with extra weight (like a logo)
ctx.font = '900 50px Arial';
ctx.textAlign = 'left';
ctx.fillText('INL', 20, 60); // Branding "INL" Logo
ctx.font = '600 20px Arial';
ctx.fillText('INDIAN NATIONAL LEAGUE', 20, 85)

// Member ID title at the top right with different font weights for "Member" and "ID"
ctx.fillStyle = '#333333';
ctx.font = '500 30px Arial';
ctx.textAlign = 'right';
ctx.fillText('MEMBER', 335, 50); // "Member" text
ctx.fillStyle = '#006600';
ctx.font = '800 40px Arial';
ctx.fillText('ID', 380, 55); // "ID" text

// Member Name (Larger Font)
ctx.fillStyle = '#333333';
ctx.font = '600 28px Arial';
ctx.textAlign = 'left';
ctx.fillText('TARIK AZIZ', 160, 200); // Member Name

// Member ID Number (Bold)
ctx.font = '500 26px Arial';
ctx.fillText('ID: INL19302', 160, 250); // ID Number

// Date of Birth
ctx.font = '20px Arial';
ctx.fillText('16-07-2000', 160, 300); // Date of Birth

// Save the current context state before clipping
ctx.save();

// Load and add the member image and barcode image
Promise.all([
    loadImage('A:/Development/indiannationalleague/Server/images/TARIK.jpg'), // Member photo path
    loadImage('A:/Development/indiannationalleague/Server/images/image.png')   // Barcode image path
]).then(([memberImage, barcode]) => {
    // Draw the rounded rectangle for the member image (increased size)
    drawRoundedRect(ctx, 20, 160, 120, 150, 15); // Increased width and height

    // Draw the member image within the rounded rectangle (larger)
    ctx.drawImage(memberImage, 20, 160, 120, 150); // Increased size for the image

    // Restore the context state to remove clipping
    ctx.restore();

    // Draw the barcode with a 10px left adjustment
    ctx.drawImage(barcode, -20, 335, 440, 150); // Adjusted x coordinate to 6 for left alignment

    //Member Type & Valid Upto
    ctx.font = '500 12px Arial';
    ctx.fillText('TYPE: ACTIVE,', 20, 335);
    ctx.fillText('VALID UPTO: 02-10-2027', 130, 335);

    // Additional Text below the barcode (like in the image)
    ctx.font = '500 15px Arial';
    ctx.fillText('Indian National League', 20, 550); // Name below the barcode
    ctx.fillText('Telephone No: 9532835303', 20, 575); // ID below the barcode



    //footer left side inl branding
    ctx.fillStyle = '#006600';
    ctx.font = '900 45px Arial';
    ctx.fillText('INL', 290, 550);
    ctx.fillStyle = '#333333';
    ctx.font = '500 20px Arial';
    ctx.fillText('MEMBER', 290 , 580)

    // Convert the canvas to a buffer and write it to a file
    const buffer = canvas.toBuffer('image/png');
    return writeFile('inl_member_id_card.png', buffer); // Save the file
}).then(() => {
    console.log('The portrait ID card with the member image was created.');
}).catch(err => {
    console.error('Failed to create the ID card:', err);
});
