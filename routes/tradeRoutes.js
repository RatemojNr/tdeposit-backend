const express = require("express");
const router = express.Router();

const User = require("../models/UserModel");
const Trade = require("../models/TradeModel");
const Ledger = require("../models/Ledger");

const { debitWallet, creditWallet } = require("../services/walletService");


// ======================
// 📊 OPEN TRADE
// ======================
router.post("/open", async (req, res) => {
    try {
        const { userId, amount, direction } = req.body;

        const safeAmount = parseFloat(amount);

        if (isNaN(safeAmount) || safeAmount <= 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.balance < safeAmount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        // 1. LOCK FUNDS
        await debitWallet(
            userId,
            safeAmount,
            "TRADE_LOCK",
            "Trade opened"
        );

        // 2. CREATE TRADE
        const trade = await Trade.create({
            userId,
            amount: safeAmount,
            direction,
            status: "open"
        });

        // 3. SIMULATE MARKET RESULT
        const win = Math.random() > 0.5;

        let profit = 0;

        if (win) {
            profit = safeAmount * 1.8; // payout multiplier
        }

        // 4. UPDATE TRADE
        trade.status = win ? "win" : "loss";
        trade.profit = profit;
        await trade.save();

        // 5. CREDIT WINNINGS
        if (win) {
            await creditWallet(
                userId,
                profit,
                "TRADE_WIN",
                "Trade profit"
            );

            await Ledger.create({
                userId,
                type: "TRADE_PROFIT",
                amount: profit,
                status: "completed",
                description: "Trade win"
            });
        } else {
            await Ledger.create({
                userId,
                type: "TRADE_LOSS",
                amount: safeAmount,
                status: "completed",
                description: "Trade loss"
            });
        }

        return res.json({
            message: "Trade completed",
            result: win ? "WIN" : "LOSS",
            profit
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});


// ======================
// 📜 GET USER TRADES
// ======================
router.get("/:userId", async (req, res) => {
    try {
        const trades = await Trade.find({
            userId: req.params.userId
        });

        return res.json(trades);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;