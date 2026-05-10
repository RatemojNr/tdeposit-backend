const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    type: {
        type: String,
        enum: [
            "DEPOSIT",
            "WITHDRAW",
            "COMMISSION"
        ],
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: [
            "pending",
            "completed",
            "failed"
        ],
        default: "completed"
    },

    reference: {
        type: String,
        default: ""
    },

    note: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
});

// ✅ PREVENT OVERWRITE ERROR
module.exports =
    mongoose.models.Ledger ||
    mongoose.model("Ledger", ledgerSchema);