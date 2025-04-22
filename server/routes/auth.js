const express = require('express');
const router = express.Router();
const fs = require("fs");
const bcrypt = require("bcrypt");
const path = require("path");

const usersFilePath = path.join(__dirname, "../../data/users.json");

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ status: "error", error: "All fields are required" });
        }

        // Read and parse users file
        const users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));

        if (users[username]) {
            return res.status(409).json({ status: "error", error: "Username already exists" });
        }

        // Hash the password
        const hash = await bcrypt.hash(password, 10);

        // Add new user
        users[username] = { username, password: hash };

        // Write updated users back to file
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", error: "Registration failed" });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const users = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));

        if (!users[username]) {
            return res.json({ status: "error", error: "Invalid username or password" });
        }

        const user = {
            username: username,
        };

        req.session.user = user;

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: "Logout failed" });
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});

module.exports = router;