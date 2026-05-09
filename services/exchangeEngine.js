const DEFAULT_RATE = 129; // 1 USD = 129 KES

/**
 * Convert KES to USD
 */
function kesToUsd(kesAmount, rate = DEFAULT_RATE) {
    if (!kesAmount || kesAmount <= 0) return 0;
    return parseFloat((kesAmount / rate).toFixed(2));
}

/**
 * Convert USD to KES
 */
function usdToKes(usdAmount, rate = DEFAULT_RATE) {
    if (!usdAmount || usdAmount <= 0) return 0;
    return parseFloat((usdAmount * rate).toFixed(2));
}

/**
 * Get current exchange rate (you can later replace with API)
 */
function getRate() {
    return DEFAULT_RATE;
}

module.exports = {
    kesToUsd,
    usdToKes,
    getRate
};