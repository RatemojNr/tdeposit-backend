const express = require("express");
const router = express.Router();

const User = require("../models/UserModel");
const Ledger = require("../models/Ledger");

// ======================
// 📩 B2C CALLBACK
// ======================
router.post("/withdraw-callback", async (req, res) => {
    try {
        const result = req.body.Result;

        if (result.ResultCode === 0) {
            const amount = result.ResultParameters.ResultParameter.find(
                p => p.Key === "TransactionAmount"
            ).Value;

            const phone = result.ResultParameters.ResultParameter.find(
                p => p.Key === "ReceiverPartyPublicName"
            ).Value;

            const user = await User.findOne({ phone });

            if (user) {
                user.balance -= Number(amount);
                await user.save();

                await Ledger.create({
                    userId: user._id,
                    type: "WITHDRAW",
                    amount,
                    note: "M-Pesa Withdrawal"
                });
            }
        }

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;