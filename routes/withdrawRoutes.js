const express = require("express");
const router = express.Router();

const User = require("../models/UserModel");
const Ledger = require("../models/Ledger");

// ======================
// 💸 REQUEST WITHDRAWAL
// ======================
router.post("/request", async (req, res) => {

    try {

        const {
            userId,
            amount,
            phone
        } = req.body;

        // ======================
        // VALIDATION
        // ======================

        if (!userId || !amount || !phone) {

            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });

        }

        const numericAmount = Number(amount);

        if (numericAmount <= 0) {

            return res.status(400).json({
                success: false,
                message: "Invalid amount"
            });

        }

        // ======================
        // FIND USER
        // ======================

        const user = await User.findById(userId);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        // ======================
        // CHECK BALANCE
        // ======================

        if (user.balance < numericAmount) {

            return res.status(400).json({
                success: false,
                message: "Insufficient balance"
            });

        }

        // ======================
        // WITHDRAW COMMISSION
        // ======================

        // Example:
        // User withdraws 100
        // Fee = 5
        // User receives 95

        const withdrawFeeRate = 0.05;

        const fee =
            numericAmount * withdrawFeeRate;

        const finalAmount =
            numericAmount - fee;

        // ======================
        // DEDUCT USER BALANCE
        // ======================

        user.balance -= numericAmount;

        await user.save();

        // ======================
        // SAVE WITHDRAWAL
        // ======================

        await Ledger.create({

            userId: user._id,

            type: "WITHDRAW",

            amount: finalAmount,

            status: "pending",

            reference: "WTH_" + Date.now(),

            note: `Withdraw to ${phone}`

        });

        // ======================
        // SAVE COMMISSION
        // ======================

        await Ledger.create({

            userId: user._id,

            type: "COMMISSION",

            amount: fee,

            status: "completed",

            reference: "COM_" + Date.now(),

            note: "Withdrawal commission"

        });

        // ======================
        // RESPONSE
        // ======================

        return res.json({

            success: true,

            message: "Withdrawal request submitted",

            requested: numericAmount,

            fee,

            amountToReceive: finalAmount,

            newBalance: user.balance

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });

    }

});

// ======================
// 📜 USER WITHDRAW HISTORY
// ======================
router.get("/:userId", async (req, res) => {

    try {

        const history = await Ledger.find({

            userId: req.params.userId,

            type: "WITHDRAW"

        }).sort({
            createdAt: -1
        });

        return res.json(history);

    } catch (error) {

        return res.status(500).json({
            error: error.message
        });

    }

});

module.exports = router;