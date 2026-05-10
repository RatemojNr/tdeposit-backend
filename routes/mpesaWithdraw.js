const express = require("express");
const axios = require("axios");
const router = express.Router();

const User = require("../models/UserModel");
const Ledger = require("../models/Ledger");
const { generateToken } = require("../services/mpesaService");

// ======================
// 💸 M-PESA WITHDRAW (B2C)
// ======================
router.post("/withdraw", async (req, res) => {
    try {
        const { userId, phone, amount } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.balance < amount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const token = await generateToken();

        const response = await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest",
            {
                InitiatorName: process.env.MPESA_INITIATOR,
                SecurityCredential: process.env.MPESA_SECURITY,
                CommandID: "BusinessPayment",
                Amount: amount,
                PartyA: process.env.MPESA_SHORTCODE,
                PartyB: phone,
                Remarks: "Wallet Withdrawal",
                QueueTimeOutURL: `${process.env.BASE_URL}/mpesa/timeout`,
                ResultURL: `${process.env.BASE_URL}/mpesa/withdraw-callback`,
                Occasion: "Withdrawal"
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        res.json(response.data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;