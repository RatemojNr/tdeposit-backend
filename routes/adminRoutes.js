const express = require("express");
const router = express.Router();

// ✅ IMPORTS
const admin = require("../middleware/adminMiddleware");
const User = require("../models/UserModel");
const Ledger = require("../models/Ledger");
const Withdrawal = require("../models/WithdrawalModel");

// ✅ WALLET SERVICE (IMPORTANT)
const { creditWallet, debitWallet } = require("../services/walletService");


// ======================
// 📊 PLATFORM STATS
// ======================
router.get("/stats", admin, async (req, res) => {
    try {
        const earnings = await Ledger.find({ type: "COMMISSION" });

        const totalEarnings = earnings.reduce((sum, tx) => {
            return sum + (tx.amount || 0);
        }, 0);

        const totalUsers = await User.countDocuments();

        return res.json({
            totalEarnings,
            totalUsers
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});


// ======================
// 👥 ALL USERS
// ======================
router.get("/users", admin, async (req, res) => {
    try {
        const users = await User.find().select("-password");

        return res.json({
            total: users.length,
            users
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});


// ======================
// 🚫 FREEZE / UNFREEZE USER
// ======================
router.post("/freeze-user", admin, async (req, res) => {
    try {
        const { userId, freeze } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.frozen = freeze;
        await user.save();

        return res.json({
            message: freeze ? "User frozen" : "User unfrozen",
            user
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});


// ======================
// 💰 CREDIT BALANCE (SAFE)
// ======================
router.post("/adjust-balance", admin, async (req, res) => {
    try {
        const { userId, amount, description } = req.body;

        const safeAmount = parseFloat(amount);

        if (isNaN(safeAmount)) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        const user = await creditWallet(
            userId,
            safeAmount,
            "ADJUSTMENT",
            description || "Manual adjustment"
        );

        return res.json({
            message: "Balance credited successfully",
            newBalance: user.balance
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});


// ======================
// 💸 DEBIT BALANCE (SAFE)
// ======================
router.post("/deduct-balance", admin, async (req, res) => {
    try {
        const { userId, amount, description } = req.body;

        const safeAmount = parseFloat(amount);

        if (isNaN(safeAmount)) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        const user = await debitWallet(
            userId,
            safeAmount,
            "ADMIN_DEBIT",
            description || "Admin deduction"
        );

        return res.json({
            message: "Balance deducted successfully",
            newBalance: user.balance
        });

    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});


// ======================
// 📜 MANUAL WITHDRAWAL LIST (optional)
// ======================
router.get("/withdrawals", admin, async (req, res) => {
    try {
        const withdrawals = await Withdrawal.find().populate("userId");

        return res.json({
            total: withdrawals.length,
            withdrawals
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});


module.exports = router;