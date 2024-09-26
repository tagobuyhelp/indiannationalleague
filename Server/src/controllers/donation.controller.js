import { Donation } from '../models/donation.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { phonepePayment } from '../utils/phonepePayment.js';
import { generateUserId } from '../utils/generateId.js';
import { Transaction } from '../models/transaction.model.js';

const handleDonationRequest = asyncHandler(async (req, res) => {
    const { donorName, donorEmail, donorPhone, amount,purpose, isAnonymous } = req.body;

    if (!donorName || !amount) {
        throw new ApiError(400, 'Donor name or amount must be provided!');
    }

    // Generate UserId
    const userId = generateUserId();

    // Create a Transaction record
    const transaction = await Transaction.create({
        memberId: userId,
        transactionType: 'donation',
        amount: amount,
        paymentStatus: 'pending'
    });


    // Create the donation record
    const donation = await Donation.create({
        donorName: donorName,
        donorEmail: donorEmail,
        donorPhone: donorPhone,
        amount: amount,
        paymentStatus: 'pending',
        purpose: purpose,
        transactionId: transaction.transactionId,
        isAnonymous: isAnonymous,
    });

    const merchantTnxId = transaction.transactionId;

    // Initiate payment with PhonePe
    const phonepeResponse = await phonepePayment(
        merchantTnxId,
        userId,
        amount,
        donorPhone
    );

    if (phonepeResponse) {
        // Send the payment URL to the frontend
        res.status(200).json({
            success: true,
            paymentUrl: phonepeResponse
        });
    } else {
        // Handle payment initiation failure
        res.status(500).json({
            success: false,
            message: 'Payment initiation failed. Please try again later.'
        });
    }
});

// If the transaction is successful - create donation
const createDonation = asyncHandler(async (req, res) => {
    const { merchantTransactionId } = req.params;

    // Fetch the transaction by its ID
    const transaction = await Transaction.findOne({
        transactionId: merchantTransactionId,
        paymentStatus: 'success'
    });

    if (!transaction) {
        throw new ApiError(400, 'Transaction not found or payment not successful');
    }

    // Create the donation record
    const donation = await Donation.create({
        donorName: transaction.memberId,  // or use req.body if donor details are passed
        amount: transaction.amount,
        transactionId: merchantTransactionId,
        donationStatus: 'confirmed'
    });

    res.status(201).json({
        success: true,
        message: 'Donation created successfully',
        donation
    });
});

export {
    handleDonationRequest,
    createDonation
};
