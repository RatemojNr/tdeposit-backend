const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { createUser, findUser } = require("../models/user");

const SECRET = process.env.JWT_SECRET || "tdeposit_secret_key";

// ======================
// REGISTER
// ======================
async function register(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({ message: "Username and password required" });
    }

    const existingUser = findUser(username);
    if (existingUser) {
        return res.json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = createUser(username, hashedPassword);

    res.json({
        message: "User created successfully",
        user
    });
}

// ======================
// LOGIN
// ======================
async function login(req, res) {
    const { username, password } = req.body;

    const user = findUser(username);

    if (!user) {
        return res.json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.json({ message: "Invalid password" });
    }

    const token = jwt.sign(
        {
            id: user.id,
            username: user.username,
            role: user.role || "user"   // ✅ FIXED (important)
        },
        SECRET,
        { expiresIn: "2h" }
    );

    res.json({
        message: "Login successful",
        token
    });
}
module.exports = {
    register,
    login
};