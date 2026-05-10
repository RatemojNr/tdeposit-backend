const User = require("../models/UserModel");
const Ledger = require("../models/Ledger"); // ✅ FIXED (NO LedgerModel)


// ======================
// 💰 CREDIT WALLET FUNCTION
// ======================
const creditWallet = async (userId, amount, type = "DEPOSIT", note = "") => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found");
        }

        // Ensure balance exists
        if (!user.balance) {
            user.balance = 0;
        }

        // Add money to wallet
        user.balance += Number(amount);

        await user.save();

        // Log transaction in ledger
        const tx = await Ledger.create({
            userId,
            type,
            amount: Number(amount),
            note: note || "Wallet credit",
        });

        return {
            user,
            transaction: tx
        };

    } catch (error) {
        console.log("Wallet credit error:", error.message);
        throw error;
    }
};


// ======================
// 💸 DEBIT WALLET FUNCTION
// ======================
const debitWallet = async (userId, amount, type = "WITHDRAW", note = "") => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found");
        }

        if (user.balance < amount) {
            throw new Error("Insufficient balance");
        }

        user.balance -= Number(amount);

        await user.save();

        const tx = await Ledger.create({
            userId,
            type,
            amount: Number(amount),
            note: note || "Wallet debit",
        });

        return {
            user,
            transaction: tx
        };

    } catch (error) {
        console.log("Wallet debit error:", error.message);
        throw error;
    }
};


// ======================
module.exports = {
    creditWallet,
    debitWallet
};