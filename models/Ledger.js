const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    type: {
        type: String,
        enum: ["DEPOSIT", "WITHDRAW", "COMMISSION"],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    note: String
}, { timestamps: true });

// 🔒 Prevent OverwriteModelError
module.exports =
    mongoose.models.Ledger || mongoose.model("Ledger", ledgerSchema);