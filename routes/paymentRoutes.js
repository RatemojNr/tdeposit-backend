const express = require("express");
const router = express.Router();

const Deposit = require("../models/DepositModel");
const { creditWallet } = require("../services/walletService");


// ======================
// 💰 INITIATE PAYMENT
// ======================
router.post("/initiate", async (req, res) => {
    try {
        const { userId, amount, provider } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        const deposit = await Deposit.create({
            userId,
            amount,
            provider,
            status: "pending",
            reference: "PAY_" + Date.now()
        });

        // 👉 Here you would call M-Pesa / Stripe API
        return res.json({
            message: "Payment initiated",
            deposit
        });

        // ======================
// 🔥 WEBHOOK (PAYMENT CONFIRMATION)
// ======================
router.post("/webhook", async (req, res) => {
    try {
        const { reference, status } = req.body;

        const Deposit = require("../models/DepositModel");
        const { creditWallet } = require("../services/walletService");

        const deposit = await Deposit.findOne({ reference });

        if (!deposit) {
            return res.status(404).json({ message: "Deposit not found" });
        }

        if (deposit.status === "completed") {
            return res.status(400).json({ message: "Already processed" });
        }

        if (status !== "success") {
            deposit.status = "failed";
            await deposit.save();
            return res.json({ message: "Payment failed" });
        }

        // ✅ CREDIT USER WALLET
        const user = await creditWallet(
            deposit.userId,
            deposit.amount,
            "DEPOSIT",
            "Payment confirmed via webhook"
        );

        deposit.status = "completed";
        await deposit.save();

        return res.json({
            message: "Deposit successful",
            newBalance: user.balance
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;