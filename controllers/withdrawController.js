const Wallet = require("../models/Wallet");
const Withdrawal = require("../models/WithdrawalModel");
const User = require("../models/UserModel");
const { sendMoney } = require("../services/mpesaB2CService");

/**
 * WITHDRAW REQUEST (SAFE VERSION)
 */
async function withdraw(req, res) {

    try {

        const { userId, amount } = req.body;

        const amt = Number(amount);

        if (!userId || !amt || amt <= 0) {
            return res.status(400).json({ message: "Invalid request" });
        }

        // ======================
        // FIND USER
        // ======================
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ======================
        // CHECK WALLET
        // ======================
        const wallet = await Wallet.findOne({ userId });

        if (!wallet || wallet.balance < amt) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        // ======================
        // LOCK FUNDS
        // ======================
        wallet.balance -= amt;
        await wallet.save();

        // ======================
        // CREATE WITHDRAWAL (PENDING)
        // ======================
        const withdrawal = await Withdrawal.create({
            userId,
            phone: user.phone,
            amount: amt,
            status: "PENDING"
        });

        // ======================
        // SEND TO M-PESA
        // ======================
        try {

            const mpesaRes = await sendMoney(user.phone, amt);

            return res.json({
                message: "Withdrawal request sent",
                withdrawal,
                mpesaRes
            });

        } catch (err) {

            // ======================
            // ROLLBACK (VERY IMPORTANT)
            // ======================
            wallet.balance += amt;
            await wallet.save();

            withdrawal.status = "FAILED";
            await withdrawal.save();

            return res.status(500).json({
                message: "M-Pesa request failed",
                error: err.message
            });
        }

    } catch (err) {

        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
}

module.exports = { withdraw };