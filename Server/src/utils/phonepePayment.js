import sha256 from 'sha256';
import axios from 'axios';
import { Transaction } from '../models/transaction.model.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Donation } from '../models/donation.model.js';
import crypto from 'crypto';


const phonepePayment = async function (merchantTransactionId, userId, amount, phoneNumber) {
    const merchantId = process.env.MERCHANT_ID;
    const saltKey = process.env.SALT_KEY;
    const saltIndex = 1;

    const payEndpoint = process.env.PHONEPE_PAY_ENDPOINT;
    const phonepeHostUrl = process.env.PHONEPE_HOST_URL;

    const redirectUrl = process.env.REDIRECT_URL

    // Prepare payload
    const payload = {
        merchantId: merchantId,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: userId,
        amount: amount * 100,
        redirectUrl: `${redirectUrl}/${merchantTransactionId}`,
        redirectMode: "POST",
        mobileNumber: phoneNumber,
        paymentInstrument: {
            "type": "PAY_PAGE"
        }
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const string = base64Payload + '/pg/v1/pay' + saltKey 
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const xVerify = sha256 + '###' + saltIndex



    // Axios request options
    const options = {
        method: 'POST',
        url: phonepeHostUrl,
        headers: {
            Accept: 'application/json', 
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
        },
        
        data: {
            request: base64Payload,
        }
    };

    // Send the request to PhonePe API
    try {
        const response = await axios.request(options);
        const url = response.data.data.instrumentResponse.redirectInfo.url
        return url
    } catch (error) {
        console.error(error);
    }
};



const status = asyncHandler(async (req, res) => {
    const merchantTransactionId = req.params.merchantTransactionId;

    if (!merchantTransactionId) {
        throw new ApiError(400, 'Merchant Transaction Id is required');
    }

    const MERCHANT_ID = process.env.MERCHANT_ID
    const successUrl = "https://indiannationalleague.party/success";
    const failurUrl = "https://indiannationalleague.party/fail"

    // Calculate xVerify

    const string = `/pg/v1/status/${process.env.MERCHANT_ID}/${merchantTransactionId}` + process.env.SALT_KEY
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + process.env.SALT_INDEX


    const options = {
        method: 'GET',
        url: `${process.env.PHONEPE_STATUS_URL}/${process.env.MERCHANT_ID}/${merchantTransactionId}`,
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
            'X-MERCHANT-ID': MERCHANT_ID
        },
    };

    try {
        // Make API request to PhonePe
        const response = await axios.request(options);

        // Check payment status from PhonePe response
        if (response.data.success === true) {
            // Find the corresponding transaction
            const transaction = await Transaction.findOne({ transactionId: merchantTransactionId });
            const donation = await Donation.findOne({transactionId: transaction.transactionId})

            if (transaction && donation) {
                // Update payment status to "completed"
                transaction.paymentStatus = "completed";
                await transaction.save();

                donation.paymentStatus = "completed";
                await transaction.save();

                return res.redirect(successUrl)
            } else {
                throw new ApiError(404, 'Transaction not found');
            }
        } else {
            // Handle other statuses like failure or pending
            return res.redirect(failurUrl)
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
    phonepePayment, 
    status
};
