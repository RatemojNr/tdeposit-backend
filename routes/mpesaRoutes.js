const express = require("express");
const router = express.Router();

const { stkPush } = require("../services/mpesaService");
const { mpesaCallback } = require("../controllers/mpesaCallbackController");
const Transaction = require("../models/Transaction");

// ======================
// STK PUSH
// ======================
router.post("/stk", async (req, res) => {
  try {
    const { phone, amount, userId } = req.body;

    // VALIDATION
    if (!phone || !amount || !userId) {
      return res.status(400).json({
        message: "Missing fields"
      });
    }

    if (!phone.startsWith("254")) {
      return res.status(400).json({
        message: "Phone must be in 254 format"
      });
    }

    // CREATE TRANSACTION FIRST
    const reference = "DEP_" + Date.now();

    const transaction = await Transaction.create({
      userId,
      type: "DEPOSIT",
      amountKES: amount,
      status: "PENDING",
      reference
    });

    // SEND STK PUSH
    const response = await stkPush(phone, amount, reference);

    // If STK fails
    if (!response || response.errorCode) {
      transaction.status = "FAILED";
      await transaction.save();

      return res.status(400).json({
        message: "STK failed",
        response
      });
    }

    return res.json({
      message: "STK sent successfully",
      checkoutRequestID: response.CheckoutRequestID,
      transaction
    });

  } catch (err) {
    console.log("STK ERROR:", err.message);

    return res.status(500).json({
      error: err.message
    });
  }
});

// ======================
// CALLBACK
// ======================
router.post("/callback", mpesaCallback);

module.exports = router;