const express = require("express");
const router = express.Router();

const Deposit = require("../models/DepositModel");
const User = require("../models/UserModel");
const Ledger = require("../models/Ledger");

const { stkPush } =
    require("../services/lipanaService");

// ======================
// INITIATE STK PUSH
// ======================
router.post("/initiate", async (req, res) => {

    try {

        const {
            userId,
            amount,
            phone
        } = req.body;

        if (!amount || amount <= 0) {

            return res.status(400).json({
                message: "Invalid amount"
            });

        }

        // SAVE PENDING DEPOSIT
        const deposit = await Deposit.create({
            userId,
            amount,
            phone,
            status: "pending"
        });

        // SEND STK PUSH
        const response =
            await stkPush(phone, amount);

        deposit.reference =
            response.reference || Date.now();

        await deposit.save();

        return res.json({
            success: true,
            message: "STK Push sent",
            response
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// ======================
// CALLBACK
// ======================
router.post("/callback", async (req, res) => {

    try {

        const {
            reference,
            status,
            amount
        } = req.body;

        const deposit =
            await Deposit.findOne({ reference });

        if (!deposit) {

            return res.status(404).json({
                message: "Deposit not found"
            });

        }

        if (deposit.status === "completed") {

            return res.json({
                message: "Already processed"
            });

        }

        if (status !== "success") {

            deposit.status = "failed";
            await deposit.save();

            return res.json({
                message: "Payment failed"
            });

        }

        // CREDIT USER
        const user =
            await User.findById(deposit.userId);

        user.balance += Number(amount);

        await user.save();

        // COMPLETE DEPOSIT
        deposit.status = "completed";

        await deposit.save();

        // SAVE LEDGER
        await Ledger.create({
            userId: user._id,
            type: "DEPOSIT",
            amount,
            note: "Lipana deposit"
        });

        return res.json({
            success: true
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            error: err.message
        });

    }

});

module.exports = router;