const User = require("../models/UserModel");
const Ledger = require("../models/Ledger ✔");
const Withdrawal = require("../models/WithdrawalModel");

// ======================
// ALL TRANSACTIONS
// ======================
async function getAllTransactions(req, res) {

    try {

        const transactions = await Ledger.find()
            .sort({ createdAt: -1 });

        return res.json({
            total: transactions.length,
            transactions
        });

    } catch (err) {

        return res.status(500).json({
            message: "Failed to fetch transactions",
            error: err.message
        });
    }
}

// ======================
// ALL USERS
// ======================
async function getAllUsers(req, res) {

    try {

        const users = await User.find().select("-password");

        return res.json({
            total: users.length,
            users
        });

    } catch (err) {

        return res.status(500).json({
            message: "Failed to fetch users",
            error: err.message
        });
    }
}

// ======================
// ALL WITHDRAWALS
// ======================
async function getAllWithdrawals(req, res) {

    try {

        const withdrawals = await Withdrawal.find()
            .sort({ createdAt: -1 });

        return res.json({
            total: withdrawals.length,
            withdrawals
        });

    } catch (err) {

        return res.status(500).json({
            message: "Failed to fetch withdrawals",
            error: err.message
        });
    }
}

// ======================
// APPROVE WITHDRAWAL
// ======================
async function approveWithdrawal(req, res) {

    try {

        const { id } = req.body;

        const withdrawal = await Withdrawal.findById(id);

        if (!withdrawal) {
            return res.status(404).json({ message: "Withdrawal not found" });
        }

        if (withdrawal.status !== "pending") {
            return res.status(400).json({
                message: "Withdrawal already processed"
            });
        }

        withdrawal.status = "approved";
        await withdrawal.save();

        return res.json({
            message: "Withdrawal approved",
            withdrawal
        });

    } catch (err) {

        return res.status(500).json({
            message: "Approval failed",
            error: err.message
        });
    }
}

// ======================
// REJECT WITHDRAWAL (SAFE REFUND)
// ======================
async function rejectWithdrawal(req, res) {

    try {

        const { id } = req.body;

        const withdrawal = await Withdrawal.findById(id);

        if (!withdrawal) {
            return res.status(404).json({
                message: "Withdrawal not found"
            });
        }

        if (withdrawal.status !== "pending") {
            return res.status(400).json({
                message: "Already processed"
            });
        }

        const user = await User.findById(withdrawal.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // REFUND WALLET SAFELY
        user.wallet = (user.wallet || 0) + withdrawal.amount;

        await user.save();

        withdrawal.status = "rejected";
        await withdrawal.save();

        return res.json({
            message: "Withdrawal rejected & refunded",
            withdrawal
        });

    } catch (err) {

        return res.status(500).json({
            message: "Rejection failed",
            error: err.message
        });
    }
}

module.exports = {
    getAllTransactions,
    getAllUsers,
    getAllWithdrawals,
    approveWithdrawal,
    rejectWithdrawal
};