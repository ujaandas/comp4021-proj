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
        const { username, avatar, name, password } = req.body;

        // Read and parse users file
        const users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));

        if (!username || !avatar || !name || !password) {
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

        users[username] = {
            avatar: avatar,
            name: name,
            password: hash  // Store the hashed password, not the plain text
        };

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
            avatar: users[username].avatar,
            name: users[username].name
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

// Serve the lobby page
app.get('/lobby', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, '../public/lobby.html'));
});

// Serve the game page
app.get('/game', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, '../public/game.html'));
});

const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Track online players and their status
const onlinePlayers = new Map();

io.use((socket, next) => {
    sessionConfig(socket.request, {}, next);
});

io.on('connection', (socket) => {
    const user = socket.request.session.user;

    if (!user) {
        return socket.disconnect(true);
    }

    // When a player enters the lobby
    socket.on('enter-lobby', () => {
        // Store socket with player info
        onlinePlayers.set(user.username, {
            socketId: socket.id,
            inGame: false,
            avatar: user.avatar,
            name: user.name
        });

        // Notify all players about the updated list
        broadcastOnlinePlayers();
    });

    // When a player leaves the lobby
    socket.on('leave-lobby', () => {
        if (onlinePlayers.has(user.username)) {
            onlinePlayers.delete(user.username);
            broadcastOnlinePlayers();
        }
    });

    // When a player sends a game request
    socket.on('game-request', ({ to }) => {
        const recipient = onlinePlayers.get(to);
        if (recipient && !recipient.inGame) {
            io.to(recipient.socketId).emit('game-request', user.username);
        }
    });


// Add this near your onlinePlayers Map
    const activeGames = new Map();

// Modify the game-accept handler to track the game
    socket.on('game-accept', ({ to }) => {
        const initiator = onlinePlayers.get(to);
        const acceptor = onlinePlayers.get(user.username);

        if (initiator && acceptor && !initiator.inGame && !acceptor.inGame) {
            // Create game record
            const gameId = `${to}-${user.username}-${Date.now()}`;
            activeGames.set(gameId, {
                players: [to, user.username],
                createdAt: Date.now()
            });

            // Store game ID with players
            onlinePlayers.get(user.username).gameId = gameId;
            onlinePlayers.get(to).gameId = gameId;

            // Mark as in game
            onlinePlayers.get(user.username).inGame = true;
            onlinePlayers.get(to).inGame = true;

            // Notify players
            setTimeout(() => {
                io.to(initiator.socketId).emit('game-start', {
                    gameId,
                    opponent: user.username,
                    isInitiator: true
                });

                io.to(acceptor.socketId).emit('game-start', {
                    gameId,
                    opponent: to,
                    isInitiator: false
                });
            }, 100);

            broadcastOnlinePlayers();
        }
    });
// When a player declines a game request
    socket.on('game-decline', ({ to }) => {
        const initiator = onlinePlayers.get(to);
        if (initiator) {
            io.to(initiator.socketId).emit('game-declined', user.username);

            // Ensure both players remain not in game
            onlinePlayers.get(user.username).inGame = false;
            if (onlinePlayers.has(to)) {
                onlinePlayers.get(to).inGame = false;
            }

            // Broadcast the updated player list
            broadcastOnlinePlayers();
        }
    });

    // When players leave the game
    socket.on('leave-game', () => {
        if (onlinePlayers.has(user.username)) {
            onlinePlayers.get(user.username).inGame = false;
            broadcastOnlinePlayers();
        }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
        if (onlinePlayers.has(user.username)) {
            console.log(`User ${user.username} disconnected: ${reason}`);
            const playerData = onlinePlayers.get(user.username);
            onlinePlayers.delete(user.username);

            // Notify other players if this player was in a game
            if (playerData.inGame) {
                io.emit('player-disconnected', user.username);
            }

            broadcastOnlinePlayers();
        }
    });

    socket.on('heartbeat', () => {
        // Refresh the player's last active time
        if (user && onlinePlayers.has(user.username)) {
            onlinePlayers.get(user.username).lastActive = Date.now();
        }
    });

    socket.on('error', (error) => {
        console.log(`Socket error for ${user.username}:`, error);
    });

    function broadcastOnlinePlayers() {
        const playersList = Array.from(onlinePlayers.entries()).map(([username, data]) => ({
            username,
            avatar: data.avatar,
            name: data.name,
            inGame: data.inGame
        }));
        io.emit('online-players', playersList);
    }

    app.get('/api/game-status', (req, res) => {
        if (!req.session.user) {
            return res.redirect('/');
        }

        const player = onlinePlayers.get(req.session.user.username);
        res.json({
            inGame: player?.inGame || false,
            opponent: player?.gameId ?
                activeGames.get(player.gameId).players.find(p => p !== req.session.user.username) : null
        });
    });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});