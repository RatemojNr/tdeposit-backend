const Transaction = require("../models/Transaction");

/**
 * CALCULATE PLATFORM PROFITS
 */
async function getProfitSummary() {

    const deposits = await Transaction.find({ type: "DEPOSIT", status: "SUCCESS" });
    const withdrawals = await Transaction.find({ type: "WITHDRAW", status: "SUCCESS" });

    // TOTAL DEPOSITS
    const totalDeposits = deposits.reduce((sum, t) => sum + (t.amountKES || 0), 0);

    // TOTAL WITHDRAWALS
    const totalWithdrawals = withdrawals.reduce((sum, t) => sum + (t.amount || 0), 0);

    // TOTAL COMMISSION
    const totalCommission = deposits.reduce((sum, t) => sum + (t.commission || 0), 0);

    // NET PROFIT (simple model)
    const netProfit = totalCommission;

    return {
        totalDeposits,
        totalWithdrawals,
        totalCommission,
        netProfit,
        activeTransactions: deposits.length + withdrawals.length
    };
}

module.exports = {
    getProfitSummary
};