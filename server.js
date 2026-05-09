require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

const app = express();

const PORT = process.env.PORT || 3000;

// ======================
// CONNECT DATABASE
// ======================
connectDB()
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.log("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

// ======================
// MIDDLEWARE
// ======================
app.use(helmet());

app.use(cors());

app.use(express.json({
  limit: "10mb"
}));

app.use(express.urlencoded({
  extended: true
}));

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: {
      message: "Too many requests. Please slow down."
    }
  })
);

// ======================
// ROUTES
// ======================

// AUTH ROUTES
app.use("/api/auth", require("./routes/authRoutes"));

// ADMIN ROUTES
app.use("/api/admin", require("./routes/adminRoutes"));

// WALLET ROUTES
app.use("/api/wallet", require("./routes/walletRoutes"));

// MPESA ROUTES
app.use("/api/mpesa", require("./routes/mpesaRoutes"));

// WITHDRAW ROUTES
app.use("/api/withdraw", require("./routes/withdrawRoutes"));

// ======================
// HOME ROUTE
// ======================
app.get("/", (req, res) => {

  res.status(200).json({
    app: "TDeposit",
    status: "running 🚀",
    uptime: process.uptime(),
    timestamp: new Date()
  });

});

// ======================
// 404 HANDLER
// ======================
app.use((req, res) => {

  res.status(404).json({
    message: "Route not found"
  });

});

// ======================
// GLOBAL ERROR HANDLER
// ======================
app.use((err, req, res, next) => {

  console.error("🔥 SERVER ERROR:");
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });

});

// ======================
// START SERVER
// ======================
app.listen(PORT, () => {

  console.log(`🚀 Server running on port ${PORT}`);

});