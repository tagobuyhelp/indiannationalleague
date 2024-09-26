import sha256 from 'sha256';
import axios from 'axios';
import { Transaction } from '../models/transaction.model.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Donation } from '../models/donation.model.js';


const phonepePayment = async function (merchantTransactionId, userId, amount, phoneNumber) {
    const merchantId = process.env.MERCHANT_ID;
    const saltKey = process.env.SALT_KEY;
    const saltIndex = 1;

    const payEndpoint = process.env.PHONEPE_PAY_ENDPOINT; // Corrected typo
    const phonepeHostUrl = process.env.PHONEPE_HOST_URL;
    

    // Prepare payload
    const payload = {
        "merchantId": merchantId,
        "merchantTransactionId": merchantTransactionId,
        "merchantUserId": userId,
        "amount": amount * 100,
        "redirectUrl": `http://localhost:${process.env.PORT}/redirect-url/${merchantTransactionId}`,
        "redirectMode": "REDIRECT",
        "mobileNumber": phoneNumber,
        "paymentInstrument": {
            "type": "PAY_PAGE"
        }
    };

    const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
    const base64EncodedPayload = bufferObj.toString("base64");

    // Calculate xVerify
    const xVerify = sha256(base64EncodedPayload + payEndpoint + saltKey) + "###" + saltIndex;

    // Axios request options
    const options = {
        method: 'POST',
        url: `${phonepeHostUrl}${payEndpoint}`,
        headers: {
            Accept: 'application/json', 
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
        },
        
        data: {
            request: base64EncodedPayload,
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



const redirectUrl = asyncHandler(async (req, res) => {
    const { merchantTransactionId } = req.params;

    if (!merchantTransactionId) {
        throw new ApiError(400, 'Merchant Transaction Id is required');
    }

    console.log('Merchant Transaction Id:', merchantTransactionId);

    // Calculate xVerify
    const xVerify = sha256(`/pg/v1/status/${process.env.MERCHANT_ID}/${merchantTransactionId}` + process.env.SALT_KEY) + "###" + process.env.SALT_INDEX;

    const options = {
        method: 'get',
        url: `${process.env.PHONEPE_HOST_URL}/pg/v1/status/${process.env.MERCHANT_ID}/${merchantTransactionId}`,
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "X-VERIFY": xVerify,
        },
    };

    try {
        // Make API request to PhonePe
        const response = await axios.request(options);

        // Check payment status from PhonePe response
        if (response.data.code === 'PAYMENT_SUCCESS') {
            // Find the corresponding transaction
            const transaction = await Transaction.findOne({ transactionId: merchantTransactionId });
            const donation = await Donation.findOne({transactionId: transaction.transactionId})

            if (transaction && donation) {
                // Update payment status to "completed"
                transaction.paymentStatus = "completed";
                await transaction.save();

                donation.paymentStatus = "completed";
                await transaction.save();

                res.status(200).json({
                    success: true,
                    message: 'Donation successful and transaction updated',
                    data: response.data,
                });
            } else {
                throw new ApiError(404, 'Transaction not found');
            }
        } else {
            // Handle other statuses like failure or pending
            res.status(200).json({
                success: false,
                message: 'Payment not successful',
                data: response.data,
            });
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
    redirectUrl
};
