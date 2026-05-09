const express = require("express");
const router = express.Router();

// ✅ FIXED IMPORTS (IMPORTANT)
const admin = require("./middleware/adminMiddleware");

const User = require("./models/UserModel");
const Ledger = require("./models/Ledger");
const Withdrawal = require("./models/WithdrawalModel");

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
        return res.status(500).json({
            error: error.message
        });
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
        return res.status(500).json({
            error: error.message
        });
    }
});

// ======================
// 🚫 FREEZE / UNFREEZE USER
// ======================
router.post("/freeze-user", admin, async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.frozen = !user.frozen;
        await user.save();

        return res.json({
            message: user.frozen ? "User frozen" : "User unfrozen",
            user
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
});

// ======================
// 💰 MANUAL BALANCE ADJUSTMENT
// ======================
router.post("/adjust-balance", admin, async (req, res) => {
    try {
        const { userId, amount, description } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const safeAmount = Number(amount);

        user.balance = (user.balance || 0) + safeAmount;

        await user.save();

        // LOG TO LEDGER
        const tx = await Ledger.create({
            userId,
            type: "ADJUSTMENT",
            amount: Math.abs(safeAmount),
            description: description || "Manual adjustment",
            status: "completed",
            balance: user.balance
        });

        return res.json({
            message: "Balance adjusted successfully",
            newBalance: user.balance,
            transaction: tx
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
});

module.exports = router;