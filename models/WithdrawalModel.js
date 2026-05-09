const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    phone: String,

    amount: Number,

    status: {
        type: String,
        default: "pending" // pending | success | failed
    },

    mpesaReceipt: String,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Withdrawal", withdrawalSchema);