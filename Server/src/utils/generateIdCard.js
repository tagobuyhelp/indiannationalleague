import { createCanvas, loadImage } from 'canvas';
import { writeFile } from 'fs/promises';
import { generateAndSaveBarcode, findBarcodeByNumber } from '../utils/barcodeGenerator.js';
import path from 'path';
import { existsSync } from 'fs';
import fs from 'fs';
import { Member } from '../models/member.model.js';
import { Membership } from '../models/membership.model.js';
import { sendMail } from '../utils/sendMail.js';

// Directory where ID cards will be saved
const idCardDirectory = path.resolve('images/idcards');

// Ensure the directory exists
if (!fs.existsSync(idCardDirectory)) {
    fs.mkdirSync(idCardDirectory, { recursive: true });
}

export const generateIdCard = async (name, id, dob, type, validUpto, memberPhotoPath) => {
    try {
        // Find or generate the barcode for the ID
        let barcodePath = await findBarcodeByNumber(id);
        if (!barcodePath || !barcodePath.filePath) {
            barcodePath = await generateAndSaveBarcode(id);
        }

        // Normalize file paths for the member photo and barcode
        const normalizedMemberPhotoPath = path.resolve(memberPhotoPath);
        const normalizedBarcodePath = path.resolve(barcodePath.filePath);

        // Ensure both the photo and barcode exist
        if (!existsSync(normalizedMemberPhotoPath)) {
            throw new Error(`Member photo does not exist at path: ${normalizedMemberPhotoPath}`);
        }
        if (!existsSync(normalizedBarcodePath)) {
            throw new Error(`Barcode does not exist at path: ${normalizedBarcodePath}`);
        }

        // Create a canvas for the portrait ID card
        const canvas = createCanvas(400, 600);
        const ctx = canvas.getContext('2d');

        // Helper function: Draw a rounded rectangle
        const drawRoundedRect = (ctx, x, y, width, height, radius) => {
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
            ctx.clip();
        };

        // Set background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 400, 600);

        // Branding and member details
        ctx.fillStyle = '#006600';
        ctx.font = '900 50px Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('INL', 20, 60);
        ctx.font = '600 20px Arial, sans-serif';
        ctx.fillText('INDIAN NATIONAL LEAGUE', 20, 85);

        ctx.fillStyle = '#333333';
        ctx.font = '500 30px Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('MEMBER', 335, 50);
        ctx.fillStyle = '#006600';
        ctx.font = '800 40px Arial, sans-serif';
        ctx.fillText('ID', 380, 55);

        const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
            const words = text.split(' ');
            let line = '';
            let lines = [];

            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = context.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    lines.push(line);
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line);
            return lines;
        };

        // Member details
        ctx.fillStyle = '#333333';
        ctx.textAlign = 'left';

        // Handle name
        let fontSize = 28;
        let nameLines = [name];
        const maxWidth = 220; // Maximum width for the name

        // Reduce font size and wrap text if name is too long
        while (fontSize > 18) {
            ctx.font = `600 ${fontSize}px Arial, sans-serif`;
            nameLines = wrapText(ctx, name, 160, 200, maxWidth, 30);
            if (nameLines.length <= 2 && ctx.measureText(nameLines[0]).width <= maxWidth) {
                break;
            }
            fontSize -= 2;
        }

        // Draw name
        let yPosition = 200;
        nameLines.forEach((line) => {
            ctx.fillText(line, 160, yPosition);
            yPosition += fontSize + 5;
        });

        // Adjust positions of other details based on name height
        const nameHeight = nameLines.length * (fontSize + 5);
        
        ctx.font = '500 26px Arial, sans-serif';
        ctx.fillText(`ID: ${id}`, 160, 200 + nameHeight + 10);
        
        ctx.font = '20px Arial, sans-serif';
        ctx.fillText(`DOB: ${dob}`, 160, 200 + nameHeight + 50);

        // Load images concurrently
        const [memberImage, barcode] = await Promise.all([
            loadImage(normalizedMemberPhotoPath),
            loadImage(normalizedBarcodePath),
        ]);

        // Draw member photo
        ctx.save();
        drawRoundedRect(ctx, 20, 160, 120, 150, 15);
        ctx.drawImage(memberImage, 20, 160, 120, 150);
        ctx.restore();

        // Draw barcode
        ctx.drawImage(barcode, 20, 355, 360, 130);

        // Additional details
        ctx.font = '500 12px Arial, sans-serif';
        ctx.fillText(`TYPE: ${type}`, 20, 335);
        ctx.fillText(`VALID UPTO: ${validUpto}`, 130, 335);

        // Footer
        ctx.font = '500 15px Arial, sans-serif';
        ctx.fillText('Indian National League', 20, 550);
        ctx.fillText('Telephone No: 9532835303', 20, 575);

        ctx.fillStyle = '#006600';
        ctx.font = '900 45px Arial, sans-serif';
        ctx.fillText('INL', 290, 550);
        ctx.fillStyle = '#333333';
        ctx.font = '500 20px Arial, sans-serif';
        ctx.fillText('MEMBER', 290, 580);

        // Save ID card
        const idCardPath = path.join(idCardDirectory, `inl_member_id_card_${id}.png`);
        const buffer = canvas.toBuffer('image/png');
        await writeFile(idCardPath, buffer);

        // Update the member record with the new ID card path
        const membership = await Membership.findOne({ memberId: id });
        if (membership) {
            const member = await Member.findOne({ email: membership.email, phone: membership.phone });
            if (member) {
                member.idCard = `/images/idcards/inl_member_id_card_${id}.png`;
                await member.save();
            }
        }

        // Email the ID card using sendMail utility
        const memberEmail = membership.email;
        const emailSubject = 'Your INL Membership ID Card';
        const emailBody = `
            <p>Dear ${name},</p>
            <p>Please find attached your INL Membership ID card.</p>
            <p>Best Regards,<br>Indian National League</p>
        `;

        await sendMail({
            to: memberEmail,
            subject: emailSubject,
            html: emailBody,
            attachments: [
                {
                    filename: `inl_member_id_card_${id}.png`,
                    path: idCardPath, // Attach the generated ID card
                },
            ],
        });
        
        


        console.log('ID card email sent successfully to:', memberEmail);
        return true;
    } catch (err) {
        console.error('Failed to create the ID card:', err.message);
        return false;
    }
};