import { Transaction } from "../models/transaction.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const getTransactions = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'asc', memberId, transactionType, paymentStatus, fields } = req.query;

    // Build filter object
    const filter = {};
    if (memberId) filter.memberId = memberId;
    if (transactionType) filter.transactionType = transactionType;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    // Convert 'order' parameter to a value for sorting
    const sortOrder = order === 'desc' ? -1 : 1;

    // Select specific fields if specified
    const selectedFields = fields ? fields.split(',').join(' ') : null;

    // Calculate pagination parameters
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    // Fetch transactions with the advanced options
    const transactions = await Transaction.find(filter)
        .select(selectedFields)
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(pageSize);

    // Count total documents for pagination info
    const totalTransactions = await Transaction.countDocuments(filter);

    res.status(200).json(new ApiResponse(200, {
        transactions,
        total: totalTransactions,
        page: pageNumber,
        pages: Math.ceil(totalTransactions / pageSize),
    }, 'All transactions retrieved successfully.'));
});

export default getTransactions;
