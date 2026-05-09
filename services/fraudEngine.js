const Transaction = require("../models/Transaction");
const FraudLog = require("../models/FraudLog");

/**
 * FRAUD CHECK BEFORE WITHDRAWAL
 */
async function checkWithdrawalFraud(userId, amount) {

    const last1Hour = new Date(Date.now() - 60 * 60 * 1000);

    const recentWithdrawals = await Transaction.find({
        userId,
        type: "WITHDRAW",
        createdAt: { $gte: last1Hour }
    });

    // RULE 1: Too many withdrawals
    if (recentWithdrawals.length >= 3) {

        await FraudLog.create({
            userId,
            type: "withdrawal_spike",
            severity: "high",
            message: "Multiple withdrawals in 1 hour",
            metadata: { count: recentWithdrawals.length }
        });

        return {
            blocked: true,
            reason: "Too many withdrawals in short time"
        };
    }

    // RULE 2: Large withdrawal spike
    const avg = recentWithdrawals.reduce((a, b) => a + (b.amount || 0), 0) / (recentWithdrawals.length || 1);

    if (amount > avg * 5 && avg > 0) {

        await FraudLog.create({
            userId,
            type: "withdrawal_spike",
            severity: "medium",
            message: "Unusual withdrawal amount detected",
            metadata: { amount, avg }
        });

        return {
            blocked: true,
            reason: "Unusual withdrawal pattern"
        };
    }

    return { blocked: false };
}

/**
 * FRAUD CHECK FOR DEPOSITS
 */
async function checkDepositFraud(userId, amount) {

    const last1Hour = new Date(Date.now() - 60 * 60 * 1000);

    const recentDeposits = await Transaction.find({
        userId,
        type: "DEPOSIT",
        createdAt: { $gte: last1Hour }
    });

    // RULE: Deposit spam
    if (recentDeposits.length >= 5) {

        await FraudLog.create({
            userId,
            type: "deposit_spike",
            severity: "high",
            message: "Deposit spam detected",
            metadata: { count: recentDeposits.length }
        });

        return {
            blocked: true,
            reason: "Too many deposits"
        };
    }

    return { blocked: false };
}

module.exports = {
    checkWithdrawalFraud,
    checkDepositFraud
};