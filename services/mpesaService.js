const axios = require("axios");

const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const shortcode = process.env.MPESA_SHORTCODE;
const passkey = process.env.MPESA_PASSKEY;
const callbackURL = process.env.MPESA_CALLBACK_URL;

// ======================
// GET ACCESS TOKEN
// ======================
async function getAccessToken() {
    try {
        const auth = Buffer.from(
            `${consumerKey}:${consumerSecret}`
        ).toString("base64");

        const res = await axios.get(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            {
                headers: {
                    Authorization: `Basic ${auth}`
                }
            }
        );

        return res.data.access_token;

    } catch (err) {
        console.log("❌ Token error:", err.response?.data || err.message);
        throw new Error("Failed to get M-Pesa token");
    }
}

// ======================
// STK PUSH
// ======================
async function stkPush(phone, amount, accountRef) {
    try {

        const token = await getAccessToken();

        const timestamp = new Date()
            .toISOString()
            .replace(/[-T:\.Z]/g, "")
            .slice(0, 14);

        const password = Buffer.from(
            shortcode + passkey + timestamp
        ).toString("base64");

        const payload = {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: phone,
            PartyB: shortcode,
            PhoneNumber: phone,
            CallBackURL: callbackURL,
            AccountReference: accountRef,
            TransactionDesc: "TDeposit Deposit"
        };

        const res = await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return res.data;

    } catch (err) {
        console.log("❌ STK error:", err.response?.data || err.message);
        throw new Error("STK Push failed");
    }
}

module.exports = {
    stkPush
};