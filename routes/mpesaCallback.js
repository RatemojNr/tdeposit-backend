const express = require("express");
const router = express.Router();

const Deposit = require("../models/DepositModel");
const User = require("../models/UserModel");
const Ledger = require("../models/Ledger");

// ======================
// CALLBACK
// ======================
router.post("/callback", async (req, res) => {

    try {

        const data =
            req.body.Body.stkCallback;

        const resultCode =
            data.ResultCode;

        const metadata =
            data.CallbackMetadata;

        if (resultCode !== 0) {

            return res.json({
                message: "Failed payment"
            });

        }

        const amount =
            metadata.Item.find(
                i => i.Name === "Amount"
            ).Value;

        const phone =
            metadata.Item.find(
                i => i.Name === "PhoneNumber"
            ).Value;

        const account =
            metadata.Item.find(
                i => i.Name === "AccountReference"
            ).Value;

        // FIND DEPOSIT
        const deposit =
            await Deposit.findById(account);

        if (!deposit) return;

        if (deposit.status === "completed") return;

        // UPDATE DEPOSIT
        deposit.status = "completed";
        await deposit.save();

        // CREDIT USER
        const user =
            await User.findById(deposit.userId);

        user.balance += Number(amount);
        await user.save();

        // LEDGER
        await Ledger.create({
            userId: user._id,
            type: "DEPOSIT",
            amount,
            note: "M-Pesa deposit"
        });

        return res.json({
            message: "Success"
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            error: err.message
        });

    }

});

module.exports = router;