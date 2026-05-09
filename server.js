require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// SECURITY MIDDLEWARE (FIRST)
// ======================
app.use(helmet());

app.use(cors());

app.use(express.json({ limit: "10mb" }));

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 60,
    message: "Too many requests, slow down."
});

app.use(limiter);

// ======================
// DATABASE
// ======================
const connectDB = require("./config/db");

connectDB()
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => {
        console.log("❌ DB Error:", err.message);
        process.exit(1);
    });

// ======================
// ROUTES
// ======================
app.use("/api/auth", require("./authRoutes"));
app.use("/api/admin", require("./adminRoutes"));
app.use("/api/wallet", require("./walletRoutes"));
app.use("/api/mpesa", require("./routes/mpesaRoutes"));
app.use("/api/withdraw", require("./routes/withdrawRoutes"));

// ======================
// HOME
// ======================
app.get("/", (req, res) => {
    res.json({
        status: "TDeposit running 🚀",
        uptime: process.uptime()
    });
});

// ======================
// GLOBAL ERROR HANDLER
// ======================
app.use((err, req, res, next) => {
    console.log("🔥 SERVER ERROR:", err);
    res.status(500).json({
        message: "Internal server error"
    });
});

// ======================
// START SERVER
// ======================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});