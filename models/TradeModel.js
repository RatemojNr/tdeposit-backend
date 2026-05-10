const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    amount: Number,

    direction: {
        type: String,
        enum: ["BUY", "SELL"]
    },

    status: {
        type: String,
        enum: ["open", "win", "loss"],
        default: "open"
    },

    profit: {
        type: Number,
        default: 0
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Trade", tradeSchema);