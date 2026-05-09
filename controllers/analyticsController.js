const { getUsers } = require("../models/user");
const { getLedger } = require("../models/ledger");

// ======================
// PLATFORM STATS
// ======================
function getPlatformStats(req, res) {
    const users = getUsers();
    const ledger = getLedger();

    const totalDeposits = ledger
        .filter(t => t.type === "deposit")
        .reduce((sum, t) => sum + (t.netAmount || 0), 0);

    const totalWithdrawals = ledger
        .filter(t => t.type === "withdrawal")
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    const profit = totalDeposits - totalWithdrawals;

    res.json({
        users: users.length,
        totalDeposits,
        totalWithdrawals,
        profit
    });
}

module.exports = {
    getPlatformStats
};