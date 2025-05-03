const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require("fs");
const bcrypt = require("bcrypt");


// Initialize Express app
const app = express();
// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Security middleware
app.use(express.json());

const usersFilePath = path.join(__dirname, "../data/users.json");


// Session Configuration
const sessionConfig = session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
});

app.use(sessionConfig);

function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

app.post('/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ status: "error", error: "All fields are required" });
        }

        // Read and parse users file
        const users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));

        if (!username || !password) {
            return res.json({ status: "error", error: "All fields are required" });
        }

        if (!containWordCharsOnly(username)) {
            return res.json({
                status: "error",
                error: "Username can only contain letters, numbers, or underscores"
            });
        }

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

app.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const users = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));

        if (!users[username]) {
            return res.json({ status: "error", error: "Invalid username or password" });
        }

        if (!bcrypt.compareSync(password, users[username].password)) {
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

app.post('/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: "Logout failed" });
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const onlineUsers = {};

io.use((socket, next) => {
    sessionConfig(socket.request, {}, next);
});

io.on('connection', (socket) => {
    const user = socket.request.session.user;
    if (user) {
        onlineUsers[user.username] = {
            name: user.name
        };

        io.emit('add user', JSON.stringify(user));
        console.log("Online users: ", JSON.stringify(onlineUsers, null, 2));

        // Handle get users request
        socket.on('get users', () => {
            socket.emit('users', JSON.stringify(onlineUsers));
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            if (user) {
                delete onlineUsers[user.username];
                // Broadcast user removal to all clients
                io.emit('remove user', JSON.stringify(user));
                console.log("Online users: ", JSON.stringify(onlineUsers, null, 2));
            }
        });

        socket.on('logout', () => {

            delete onlineUsers[user.username];

            io.emit('user disconnected', socket.id);
        });

    }
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});