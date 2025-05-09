const express = require("express");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const session = require("express-session");

const _dirname = path.resolve(); // Gets the current directory
console.log(_dirname)
// Initialize Express app
const app = express();
// Serve static files
app.use(express.static(`${_dirname}/public`));

// Security middleware
app.use(express.json());

const usersFilePath = `${_dirname}/data/users.json`;

// Session Configuration
const sessionConfig = session({
  secret: "secret-key",
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: { maxAge: 300000 },
  sameSite: "lax"
});

app.use(sessionConfig);

function containWordCharsOnly(text) {
  return /^\w+$/.test(text);
}

app.post("/auth/register", async (req, res) => {
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
        error: "Username can only contain letters, numbers, or underscores",
      });
    }

    if (users[username]) {
      return res
        .status(409)
        .json({ status: "error", error: "Username already exists" });
    }

    // Hash the password
    const hash = await bcrypt.hashSync(password, 10);

    users[username] = {
      avatar: avatar,
      name: name,
      password: hash, // Store the hashed password, not the plain text
    };

    // Write updated users back to file
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: "Registration failed" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));

    if (!users[username]) {
      return res.json({
        status: "error",
        error: "Invalid username or password",
      });
    }

    if (!bcrypt.compareSync(password, users[username].password)) {
      return res.json({
        status: "error",
        error: "Invalid username or password",
      });
    }

    const user = {
      username: username,
      avatar: users[username].avatar,
      name: users[username].name,
    };

    req.session.user = user;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

// Serve the lobby page
app.get("/lobby", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  res.sendFile(path.join(_dirname, "/public/lobby.html"));
});

// Serve the game page
app.get("/game", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  res.sendFile(path.join(_dirname, "/public/game.html"));
});

const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
  pingInterval: 30000,
  pingTimeout: 20000,
  connectionStateRecovery: {
    maxDisconnectionDuration: 120000
  }
});

// Track online players and their status
const onlinePlayers = new Map();

io.use((socket, next) => {
  sessionConfig(socket.request, {}, next);
});

const activeGames = new Map();

io.on("connection", (socket) => {
  const user = socket.request.session.user;
  console.log("user" + user);
  if (!user) {
    return socket.disconnect(true);
  }

  socket.username = user.username;

  const prevSessionId = socket.handshake.auth.sessionId;
  if (prevSessionId) {
    // Reattach to previous session
    socket.join(prevSessionId);
  }

  socket.on('game-ready-to-start', ({ opponent }) => {
    // Find game where these two players are matched
    const game = Array.from(activeGames.values()).find(g =>
        g.players.includes(socket.username) &&
        g.players.includes(opponent)
    );

    if (!game) {
      return socket.emit('game-error', 'Game not found');
    }

    // Mark player as ready
    game.readyPlayers.add(socket.username);

    // If both ready, redirect
    if (game.readyPlayers.size === 2) {
      // Store game ID in session
      game.sockets.forEach(sockId => {
        io.to(sockId).emit('redirect-to-game', {
          gameId: game.gameId
        });
      });

      activeGames.delete(game.gameId);
    }
  });

  socket.on('player-ready', ({ gameId }) => {
    const game = activeGames.get(gameId);
    if (game) {
      game.readyPlayers.add(socket.username);

      // If both players are ready
      if (game.readyPlayers.size === 2) {
        io.to(gameId).emit('redirect-to-game', { gameId });
        activeGames.delete(gameId);
      }
    }
  });

  // When a player enters the lobby
  socket.on("enter-lobby", () => {
    // Join a room with the username
    socket.join(user.username);

    onlinePlayers.set(user.username, {
      socketId: socket.id,
      inGame: false,
      avatar: user.avatar,
      name: user.name,
    });

    broadcastOnlinePlayers();
  });

  // When a player leaves the lobby
  socket.on("leave-lobby", () => {
    if (onlinePlayers.has(user.username)) {
      onlinePlayers.delete(user.username);
      broadcastOnlinePlayers();
    }
  });

  // When a player sends a game request
  socket.on("game-request", ({ to }) => {
    const recipient = onlinePlayers.get(to);
    if (recipient && !recipient.inGame) {
      io.to(recipient.socketId).emit("game-request", user.username);
    }
  });

  // Modify the game-accept handler to track the game

  socket.on("game-accept", ({ to }) => {
    const initiator = onlinePlayers.get(to);
    const acceptor = onlinePlayers.get(user.username);

    if (initiator && acceptor) {
      // Create consistent game ID
      const gameId = `game-${[to, user.username].sort().join('-')}-${Date.now()}`;

      // Mark both players as in game
      onlinePlayers.get(to).inGame = true;
      onlinePlayers.get(user.username).inGame = true;

      // Create game entry
      activeGames.set(gameId, {
        players: [to, user.username],
        gameId: gameId
      });

      // Store game ID with players
      onlinePlayers.get(to).gameId = gameId;
      onlinePlayers.get(user.username).gameId = gameId;

      // Notify both players and redirect immediately
      io.to(initiator.socketId).emit("redirect-to-game", { gameId });
      io.to(acceptor.socketId).emit("redirect-to-game", { gameId });

      broadcastOnlinePlayers();
    }
  });
  // When a player declines a game request
  socket.on("game-decline", ({ to }) => {
    const initiator = onlinePlayers.get(to);
    if (initiator) {
      io.to(initiator.socketId).emit("game-declined", user.username);

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
  socket.on("leave-game", () => {
    if (onlinePlayers.has(user.username)) {
      onlinePlayers.get(user.username).inGame = false;
      broadcastOnlinePlayers();
    }
  });

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    if (onlinePlayers.has(user.username)) {
      console.log(`User ${user.username} disconnected: ${reason}`);
      const playerData = onlinePlayers.get(user.username);
      onlinePlayers.delete(user.username);

      // Notify other players if this player was in a game
      if (playerData.inGame) {
        io.emit("player-disconnected", user.username);
      }

      broadcastOnlinePlayers();
    }
  });

  socket.on("error", (error) => {
    console.log(`Socket error for ${user.username}:`, error);
  });

  function broadcastOnlinePlayers() {
    const playersList = Array.from(onlinePlayers.entries()).map(
      ([username, data]) => ({
        username,
        avatar: data.avatar,
        name: data.name,
        inGame: data.inGame,
      })
    );
    io.emit("online-players", playersList);
  }

  app.get("/api/game-status", (req, res) => {
    if (!req.session.user) {
      return res.redirect("/");
    }

    const player = onlinePlayers.get(req.session.user.username);
    res.json({
      inGame: player?.inGame || false,
      opponent: player?.gameId
        ? activeGames
            .get(player.gameId)
            .players.find((p) => p !== req.session.user.username)
        : null,
    });
  });
  socket.on("disconnect", (reason) => {
    console.log(`[SERVER] Disconnected ${socket.id}: ${reason}`);
  });
});

function findSocketByUsername(username) {
  const sockets = io.of("/").sockets; // Gets all connected sockets

  for (const [id, socket] of sockets) {
    if (socket.username === username) {
      return socket;
    }
  }
  return null; // Explicit return if not found
}

const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
