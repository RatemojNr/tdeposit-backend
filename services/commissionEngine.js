const DEFAULT_COMMISSION_RATE = 0.055; // 5.5%

/**
 * Calculate commission from KES amount
 */
function calculateCommission(kesAmount, rate = DEFAULT_COMMISSION_RATE) {
    if (!kesAmount || kesAmount <= 0) {
        return {
            commissionKES: 0,
            netKES: 0
        };
    }

    const commissionKES = parseFloat((kesAmount * rate).toFixed(2));
    const netKES = parseFloat((kesAmount - commissionKES).toFixed(2));

    return {
        commissionKES,
        netKES
    };
}

/**
 * Calculate commission in USD after conversion
 */
function calculateCommissionUSD(usdAmount, rate = DEFAULT_COMMISSION_RATE) {
    if (!usdAmount || usdAmount <= 0) {
        return {
            commissionUSD: 0,
            netUSD: 0
        };
    }

    const commissionUSD = parseFloat((usdAmount * rate).toFixed(2));
    const netUSD = parseFloat((usdAmount - commissionUSD).toFixed(2));

    return {
        commissionUSD,
        netUSD
    };
}

/**
 * Get commission rate
 */
function getCommissionRate() {
    return DEFAULT_COMMISSION_RATE;
}

module.exports = {
    calculateCommission,
    calculateCommissionUSD,
    getCommissionRate
};