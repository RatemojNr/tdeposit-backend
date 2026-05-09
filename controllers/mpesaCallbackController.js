const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const User = require("../models/UserModel");

const { calculateCommission } = require("../services/commissionEngine");
const { kesToUsd } = require("../services/exchangeEngine");

/**
 * MPESA CALLBACK (PRODUCTION SAFE)
 */
async function mpesaCallback(req, res) {

    try {

        const result = req.body?.Body?.stkCallback;

        console.log("M-Pesa Callback:", JSON.stringify(req.body));

        if (!result) {
            return res.json({
                ResultCode: 1,
                ResultDesc: "Invalid callback"
            });
        }

        // PAYMENT FAILED
        if (result.ResultCode !== 0) {
            return res.json({
                ResultCode: 1,
                ResultDesc: "Payment failed"
            });
        }

        const metadata = result.CallbackMetadata?.Item || [];

        const amount = metadata.find(i => i.Name === "Amount")?.Value;
        const phone = metadata.find(i => i.Name === "PhoneNumber")?.Value;
        const receipt = metadata.find(i => i.Name === "MpesaReceiptNumber")?.Value;
        const checkoutId = result.CheckoutRequestID;

        if (!amount || !phone || !receipt) {
            return res.json({
                ResultCode: 1,
                ResultDesc: "Missing data"
            });
        }

        // ======================
        // AVOID DOUBLE CREDIT
        // ======================
        const existing = await Transaction.findOne({
            reference: receipt
        });

        if (existing) {
            return res.json({
                ResultCode: 0,
                ResultDesc: "Already processed"
            });
        }

        // ======================
        // FIND USER
        // ======================
        const user = await User.findOne({ phone });

        if (!user) {
            return res.json({
                ResultCode: 1,
                ResultDesc: "User not found"
            });
        }

        const userId = user._id;

        // ======================
        // COMMISSION CALC
        // ======================
        const { commissionKES, netKES } = calculateCommission(amount);
        const amountUSD = kesToUsd(netKES);

        // ======================
        // SAVE TRANSACTION
        // ======================
        const transaction = await Transaction.create({
            userId,
            type: "DEPOSIT",
            amountKES: amount,
            amountUSD,
            commission: commissionKES,
            status: "SUCCESS",
            reference: receipt,
            checkoutRequestID: checkoutId
        });

        // ======================
        // UPDATE WALLET
        // ======================
        let wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            wallet = await Wallet.create({
                userId,
                balance: 0
            });
        }

        wallet.balance = Number(wallet.balance) + Number(amount);
        await wallet.save();

        console.log("Deposit successful ✔");

        return res.json({
            ResultCode: 0,
            ResultDesc: "Accepted"
        });

    } catch (err) {

        console.log("Callback error:", err.message);

        return res.json({
            ResultCode: 1,
            ResultDesc: "Failed"
        });
    }
}

module.exports = {
    mpesaCallback
};