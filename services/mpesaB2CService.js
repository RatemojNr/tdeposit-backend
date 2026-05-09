const axios = require("axios");

const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const shortcode = process.env.MPESA_SHORTCODE;
const securityCredential = process.env.MPESA_SECURITY_CREDENTIAL;
const callbackURL = process.env.MPESA_B2C_CALLBACK_URL;

// TOKEN
async function getAccessToken() {

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

    const res = await axios.get(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        {
            headers: {
                Authorization: `Basic ${auth}`
            }
        }
    );

    return res.data.access_token;
}

// SEND MONEY (B2C)
async function sendMoney(phone, amount) {

    const token = await getAccessToken();

    const payload = {
        InitiatorName: "testapi",
        SecurityCredential: securityCredential,
        CommandID: "BusinessPayment",
        Amount: amount,
        PartyA: shortcode,
        PartyB: phone,
        Remarks: "TDeposit Withdrawal",
        QueueTimeOutURL: callbackURL,
        ResultURL: callbackURL,
        Occasion: "Withdrawal"
    };

    const res = await axios.post(
        "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest",
        payload,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return res.data;
}

module.exports = {
    sendMoney
};