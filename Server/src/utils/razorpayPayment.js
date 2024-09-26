import Razorpay from 'razorpay'

const createRazorpayOrder = async function (amount, currency, receipt) {
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

    const instance = new Razorpay({key_id: razorpayKeyId, key_secret: razorpayKeySecret})

    var options = {
        amount: amount,
        currency: currency,
        receipt: receipt
    }


    try {
        const order = await instance.orders.create(options)
        return order
    } catch (error) {
        console.log("Error creating Razorpay order:", error);
    }
}

export { createRazorpayOrder }



// Usage example:
const result = await createRazorpayOrder(5000, "INR", "tb3939");
console.log(result);
