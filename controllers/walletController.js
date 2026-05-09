const User = require("../models/UserModel");
const Ledger = require("../models/LedgerModel");
const Withdrawal = require("../models/WithdrawalModel");

const { calculateCommission } = require("../services/commissionService");
const { sendToDeriv } = require("../services/derivService");
const { reconcileWallet } = require("../services/reconciliationService");

// =======================
// DEPOSIT
// =======================
async function deposit(req, res) {
    try {
        const { username, amount } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.json({ message: "User not found" });
        }

        const result = calculateCommission(amount);

        // Update wallet
        user.wallet += result.netAmount;

        // Save history
        user.history.push({
            type: "credit",
            amount: result.netAmount,
            commission: result.commission,
            note: "Deposit after commission",
            date: new Date()
        });

        await user.save();

        // Save ledger
        await Ledger.create({
            username,
            type: "deposit",
            amount: result.original,
            commission: result.commission,
            netAmount: result.netAmount,
            status: "processed"
        });

        // Send to Deriv
        const derivResponse = sendToDeriv(user, result.netAmount);

        res.json({
            message: "Deposit processed successfully",
            originalAmount: result.original,
            commission: result.commission,
            creditedToWallet: result.netAmount,
            wallet: user.wallet,
            deriv: derivResponse
        });

    } catch (err) {
        res.json({
            message: "Deposit failed",
            error: err.message
        });
    }
}

// =======================
// BALANCE
// =======================
async function balance(req, res) {
    try {
        const { username } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.json({ message: "User not found" });
        }

        res.json({
            wallet: user.wallet,
            history: user.history
        });

    } catch (err) {
        res.json({
            message: "Balance fetch failed",
            error: err.message
        });
    }
}

// =======================
// SYNC
// =======================
async function sync(req, res) {
    try {
        const { username } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.json({ message: "User not found" });
        }

        const result = reconcileWallet(user);

        res.json({
            message: "Reconciliation report",
            ...result
        });

    } catch (err) {
        res.json({
            message: "Sync failed",
            error: err.message
        });
    }
}

// =======================
// WITHDRAW
// =======================
async function withdraw(req, res) {
    try {
        const { username, amount } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.json({ message: "User not found" });
        }

        if (amount <= 0) {
            return res.json({ message: "Invalid amount" });
        }

        if (user.wallet < amount) {
            return res.json({ message: "Insufficient balance" });
        }

        // Deduct wallet
        user.wallet -= amount;

        // Save history
        user.history.push({
            type: "withdrawal",
            amount,
            status: "pending",
            date: new Date()
        });

        await user.save();

        // Save withdrawal request
        const request = await Withdrawal.create({
            username,
            amount,
            status: "pending"
        });

        // Save ledger
        await Ledger.create({
            username,
            type: "withdrawal",
            amount,
            status: "pending"
        });

        res.json({
            message: "Withdrawal request created",
            request,
            wallet: user.wallet
        });

    } catch (err) {
        res.json({
            message: "Withdrawal failed",
            error: err.message
        });
    }
}

// =======================
// EXPORTS
// =======================
module.exports = {
    deposit,
    balance,
    sync,
    withdraw
};