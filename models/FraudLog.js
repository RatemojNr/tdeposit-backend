const mongoose = require("mongoose");

const fraudSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    type: String, // withdrawal_spike, deposit_spike, velocity, etc

    severity: {
        type: String,
        default: "low" // low | medium | high
    },

    message: String,

    metadata: Object,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("FraudLog", fraudSchema);