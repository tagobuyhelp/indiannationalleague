import { Membership } from "../models/membership.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Transaction } from "../models/transaction.model.js";
import { generateTnxId, generateUserId } from "../utils/generateId.js";
import { phonepePayment } from "../utils/phonepePayment.js";
import { sendMail } from "../utils/sendMail.js"; // Import sendMail utility
import crypto from 'crypto';
import axios from 'axios';

const createFees = asyncHandler(async (req, res) => {
    const { amount, validity, email, mobileNumber } = req.body;

    const memberId = generateUserId();

    // Validate input
    if (amount === undefined || validity === undefined || email === undefined || mobileNumber === undefined) {
        throw new ApiError(400, "Member Id, fee, email and validity are required");
    }

    const existingMembership = await Membership.findOne({ memberId });
    if (existingMembership && existingMembership.status === 'active') {
        throw new ApiError(400, "Membership active or fees already paid");
    }

    // Generate a transaction ID
    const transactionId = generateTnxId();

    // Create the transaction
    const transaction = await Transaction.create({
        memberId,
        transactionId,
        transactionType: 'membershipFees',
        paymentStatus: 'pending',
        amount,
    });

    // Create the membership
    const membership = await Membership.create({
        memberId,
        phone: mobileNumber,
        email,
        transaction: transaction._id,
        type: 'membershipFees',
        fee: amount,
        validity,
        status: 'inactive',
    });

    const redirectUrl = process.env.MEMBERSHIP_PAYMENT_STATUS_URL;

    // Initiate Payment With Phonepe
    const paymentUrl = await phonepePayment(
        transactionId,
        memberId,
        amount,
        mobileNumber,
        redirectUrl
    );

    // Send payment initiation email
    const emailContent = `
    <p>Dear Member,</p>
    <p>Your payment process for the membership fee has been initiated successfully.</p>
    <p>Amount: ₹${amount}</p>
    <p>Transaction ID: ${transactionId}</p>
    <p>Please complete the payment using the link below:</p>
    <a href="${paymentUrl}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; background-color: #006600; color: white; text-align: center; text-decoration: none; border-radius: 5px;">Complete Payment</a>
    <p>Thank you!</p>
    
    <hr style="margin: 20px 0; border: 1px solid #ccc;">
    
    <p><strong>Address</strong></p>
    <p>
        INDIAN NATIONAL LEAGUE<br>
        Registered Address: 7 B. R. Mehta Lane, Kasturba Gandhi Marg Cross,<br>
        New Delhi Central Delhi DELHI 110001<br>
        Operational Address: 7 B. R. Mehta Lane, Kasturba Gandhi Marg Cross,<br>
        New Delhi Central Delhi DELHI 110001
    </p>

    <p><strong>Contact Information</strong><br>
        Telephone No: 9532835303<br>
        E-Mail ID: info@indiannationalleague.party
    </p>
`;

    await sendMail({
        to: email,
        subject: "Membership Fees Payment Initiated",
        html: emailContent
    });
    

    // Respond with created transaction and membership
    if (paymentUrl) {
        res.status(200).json(
            new ApiResponse(200, paymentUrl, 'Payment for your Membership Fees initiated...')
        );
    } else {
        throw new ApiError(500, "Payment initiation failed. Please try again.");
    }
});

const checkPaymentStatus = asyncHandler(async (req, res) => {
    const merchantTransactionId = req.params.merchantTransactionId;

    if (!merchantTransactionId) {
        throw new ApiError(400, 'Merchant Transaction Id is required');
    }

    const MERCHANT_ID = process.env.MERCHANT_ID;
    const successUrl = "https://indiannationalleague.party/memberships-success";
    const failureUrl = "https://indiannationalleague.party/membership-fail";

    // Calculate xVerify
    const string = `/pg/v1/status/${process.env.MERCHANT_ID}/${merchantTransactionId}` + process.env.SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + process.env.SALT_INDEX;

    const options = {
        method: 'GET',
        url: `${process.env.PHONEPE_STATUS_URL}/${process.env.MERCHANT_ID}/${merchantTransactionId}`,
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
            'X-MERCHANT-ID': MERCHANT_ID,
        },
    };

    try {
        // Make API request to PhonePe
        const response = await axios.request(options);

        // Check payment status from PhonePe response
        if (response.data.success === true) {
            // Find the corresponding transaction
            const transaction = await Transaction.findOne({ transactionId: merchantTransactionId });
            const membership = await Membership.findOne({ transaction: transaction._id });


            if (transaction && membership) {
                transaction.paymentStatus = "completed";
                await transaction.save();

                membership.status = "active";
                await membership.save();

                // Send success email
                const emailContent = `
                    <p>Dear Member,</p>
                    <p><strong>Your INL ID:</strong> ${membership.memberId}</p>
                    <p>Your membership fee payment was successful.</p>
                    <p>Amount: ₹${transaction.amount}</p>
                    <p>Transaction ID: ${merchantTransactionId}</p>
                    <p>Your membership is now active.</p>
                    <p>Thank you for your payment!</p>
                `;
            await sendMail({
                to: membership.email,
                subject: 'Membership Payment Success',
                html: emailContent
            })

                return res.redirect(successUrl);
            } else {
                throw new ApiError(404, 'Transaction not found');
            }
        } else {
            // Find the corresponding transaction
            const transaction = await Transaction.findOne({ transactionId: merchantTransactionId });
            const membership = await Membership.findOne({ transaction: transaction._id });

            if (transaction) {
                transaction.paymentStatus = "failed";
                await transaction.save();
            }


            // Send failure email
            const emailContent = `
                <p>Dear Member,</p>
                <p>Your payment for membership fees failed.</p>
                <p>Transaction ID: ${merchantTransactionId}</p>
                <p>Please try again or contact support for further assistance.</p>
            `;
            await sendMail({
                to: membership.email,
                subject: 'Membership Payment Failed',
                html: emailContent
            })

            // Handle other statuses like failure or pending
            return res.redirect(failureUrl);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error while checking payment status',
            error: error.message,
        });
    }
});

export {
    createFees,
    checkPaymentStatus,
};
