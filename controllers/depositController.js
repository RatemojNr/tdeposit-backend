const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

const { stkPush } = require("../services/mpesaService");
const { calculateCommission } = require("../services/commissionEngine");
const { kesToUsd } = require("../services/exchangeEngine");
const { checkDepositFraud } = require("../services/fraudEngine");

/**
 * INITIATE DEPOSIT (STK PUSH)
 */
async function deposit(req, res) {

    try {

        const { userId, phone, amountKES } = req.body;

        const amount = Number(amountKES);

        if (!userId || !phone || !amount || amount <= 0) {
            return res.status(400).json({
                message: "Invalid deposit data"
            });
        }

        // ======================
        // FRAUD CHECK (BEFORE STK)
        // ======================
        const fraudCheck = await checkDepositFraud(userId, amount);

        if (fraudCheck.blocked) {
            return res.status(403).json({
                message: "Deposit blocked",
                reason: fraudCheck.reason
            });
        }

        // ======================
        // COMMISSION CALC
        // ======================
        const { commissionKES, netKES } = calculateCommission(amount);

        const amountUSD = kesToUsd(netKES);

        // ======================
        // CREATE PENDING TX
        // ======================
        const reference = "DEP_" + Date.now();

        const transaction = await Transaction.create({
            userId,
            type: "DEPOSIT",
            amountKES: amount,
            amountUSD,
            commission: commissionKES,
            status: "PENDING",
            reference
        });

        // ======================
        // SEND STK PUSH
        // ======================
        const stkResponse = await stkPush(phone, amount, reference);

        return res.json({
            message: "STK push sent",
            checkoutRequestID: stkResponse.CheckoutRequestID,
            transaction,
            breakdown: {
                totalKES: amount,
                commissionKES,
                netKES,
                amountUSD
            }
        });

    } catch (err) {

        console.log("Deposit error:", err.message);

        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
}

module.exports = { deposit };