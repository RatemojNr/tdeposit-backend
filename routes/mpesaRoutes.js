const express = require("express");
const router = express.Router();

const { stkPush } = require("../services/mpesaService");
const { mpesaCallback } = require("../controllers/mpesaCallbackController");
const Transaction = require("../models/Transaction");

// ======================
// INITIATE STK PUSH
// ======================
router.post("/stk", async (req, res) => {

    try {

        const { phone, amount, userId } = req.body;

        if (!phone || !amount || !userId) {
            return res.status(400).json({
                message: "Missing fields"
            });
        }

        // ======================
        // CREATE PENDING TRANSACTION FIRST
        // ======================
        const reference = "DEP_" + Date.now();

        const transaction = await Transaction.create({
            userId,
            type: "DEPOSIT",
            amountKES: amount,
            status: "PENDING",
            reference
        });

        // ======================
        // SEND STK PUSH
        // ======================
        const response = await stkPush(phone, amount, reference);

        return res.json({
            message: "STK sent",
            checkoutRequestID: response.CheckoutRequestID,
            transaction
        });

    } catch (err) {

        return res.status(500).json({
            error: err.message
        });
    }
});

// ======================
// CALLBACK (SAFARICOM)
// ======================
router.post("/callback", mpesaCallback);

module.exports = router;