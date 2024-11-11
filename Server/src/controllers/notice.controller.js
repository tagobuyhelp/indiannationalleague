import { Notice } from '../models/notice.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendMail } from '../utils/sendMail.js'; // Assuming sendMail is a utility to send emails
import { ApiResponse } from '../utils/apiResponse.js';

const createNotice = asyncHandler(async (req, res) => {
    const { title, description, recipients } = req.body;

    // Validate the input
    if (!title || !description || !recipients || recipients.length === 0) {
        throw new Error('Title, description, and recipients are required');
    }

    // Create a new notice
    const notice = new Notice({
        title,
        description,
        recipients
    });

    await notice.save();

    // Send the notice by email
    const emailSent = await sendNoticeEmail(notice.title, notice.description, notice.recipients);

    if (!emailSent) {
        throw new Error('Failed to send email');
    }

    res.status(201).json(new ApiResponse(201, notice, 'Notice created and emails sent.'));
});

// Function to send notice emails to recipients
const sendNoticeEmail = async (title, description, recipients) => {
    const emailSubject = `${title}`;
    const emailBody = `
        <h1>${title}</h1>
        <p>${description}</p>
    `;

    try {
        for (let email of recipients) {
            await sendMail({
                to: email,
                subject: emailSubject,
                html: emailBody
            });
        }
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

const getNotices = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, search = '' } = req.query;

    // Prepare filters
    const filters = {};
    if (status) {
        filters.status = status; // Filter by status (active, inactive)
    }
    if (search) {
        // Search notices by title or content
        filters.$or = [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } }
        ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    const notices = await Notice.find(filters)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ date: -1 });  // Sort by date, descending (newest first)

    const totalNotices = await Notice.countDocuments(filters);  // Get the total number of notices matching the filters
    const totalPages = Math.ceil(totalNotices / limit);  // Calculate the total number of pages

    if (!notices || notices.length === 0) {
        throw new ApiError(404, 'No notices found');
    }

    res.status(200).json(
        new ApiResponse(200, { notices, totalNotices, totalPages }, 'Notices retrieved successfully.')
    );
});

export { createNotice, getNotices };
