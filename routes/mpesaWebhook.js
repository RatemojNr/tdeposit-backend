const express = require("express");
const router = express.Router();

const Deposit = require("../models/DepositModel");
const { creditWallet } = require("../services/walletService");

router.post("/webhook", async (req, res) => {
    try {
        const callback = req.body.Body.stkCallback;

        const resultCode = callback.ResultCode;

        const reference = callback.CallbackMetadata?.Item?.find(
            x => x.Name === "AccountReference"
        )?.Value;

        const amount = callback.CallbackMetadata?.Item?.find(
            x => x.Name === "Amount"
        )?.Value;

        const deposit = await Deposit.findOne({ reference });

        if (!deposit) return res.sendStatus(404);

        if (resultCode !== 0) {
            deposit.status = "failed";
            await deposit.save();
            return res.json({ message: "Failed payment" });
        }

        await creditWallet(
            deposit.userId,
            amount,
            "DEPOSIT",
            "M-Pesa deposit"
        );

        deposit.status = "completed";
        await deposit.save();

        return res.json({ message: "Success" });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;