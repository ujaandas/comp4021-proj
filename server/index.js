const express = require("express");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const session = require("express-session");

const _dirname = path.resolve();
console.log(_dirname);

// Initialize Express app
const app = express();
app.use(express.static(`${_dirname}/public`));
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

// Auth Routes
app.post("/auth/register", async (req, res) => {
  try {
    const { username, avatar, name, password } = req.body;
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

    const hash = await bcrypt.hashSync(password, 10);
    users[username] = {
      avatar: avatar,
      name: name,
      password: hash,
    };

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

// Page Routes
app.get("/lobby", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  res.sendFile(path.join(_dirname, "/public/lobby.html"));
});

app.get("/game", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  res.sendFile(path.join(_dirname, "/public/game.html"));
});

// Socket.io Setup
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
  pingInterval: 30000,
  pingTimeout: 20000,
  connectionStateRecovery: {
    maxDisconnectionDuration: 120000
  }
});

// Track online players and active games
const onlinePlayers = new Map();
const activeGames = new Map();

io.use((socket, next) => {
  sessionConfig(socket.request, {}, next);
});

io.on("connection", (socket) => {
  const user = socket.request.session.user;
  if (!user) return socket.disconnect(true);

  socket.username = user.username;
  const prevSessionId = socket.handshake.auth.sessionId;
  if (prevSessionId) socket.join(prevSessionId);

  // When player enters lobby
  socket.on("enter-lobby", () => {
    socket.join(user.username);
    onlinePlayers.set(user.username, {
      socketId: socket.id,
      inGame: false,
      avatar: user.avatar,
      name: user.name,
    });
    broadcastOnlinePlayers();
  });

  // When player leaves lobby
  socket.on("leave-lobby", () => {
    if (onlinePlayers.has(user.username)) {
      onlinePlayers.delete(user.username);
      broadcastOnlinePlayers();
    }
  });

  // Game request handling
  socket.on("game-request", ({ to }) => {
    const recipient = onlinePlayers.get(to);
    if (recipient && !recipient.inGame) {
      io.to(recipient.socketId).emit("game-request", user.username);
    }
  });

  // Game accept handling (NO REDIRECTION HERE)
  socket.on("game-accept", ({ to }) => {
    const initiator = onlinePlayers.get(to);
    const acceptor = onlinePlayers.get(user.username);

    if (initiator && acceptor) {
      const gameId = `game-${[to, user.username].sort().join('-')}-${Date.now()}`;

      console.log("gameid" + initiator.socketId + acceptor.socketId + user.username + to)
      onlinePlayers.get(to).inGame = true;
      onlinePlayers.get(user.username).inGame = true;

      activeGames.set(gameId, {
        players: [to, user.username],
        sockets: [initiator.socketId, acceptor.socketId],
      });

      console.log("game" + activeGames[0])

      // Notify both players but DON'T redirect yet
      io.to(initiator.socketId).emit("game-start", {
        opponent: user.username,
        isInitiator: true,
        gameId
      });

      io.to(acceptor.socketId).emit("game-start", {
        opponent: to,
        isInitiator: false,
        gameId
      });

      broadcastOnlinePlayers();
    }
  });

// Replace the old start-game handler with:
  socket.on("initiator-ready", ({ gameId }) => {
    const game = activeGames.get(gameId);
    if (!game) return;

    const initiatorSocket = io.sockets.sockets.get(game.sockets[0]);
    const acceptorSocket = io.sockets.sockets.get(game.sockets[1]);

    initiatorSocket.emit('redirect-to-game', { gameId });
    acceptorSocket.emit('redirect-to-game', { gameId });

    activeGames.delete(gameId);

  });

  // Game decline handling
  socket.on("game-decline", ({ to }) => {
    const initiator = onlinePlayers.get(to);
    if (initiator) {
      io.to(initiator.socketId).emit("game-declined", user.username);
      onlinePlayers.get(user.username).inGame = false;
      if (onlinePlayers.has(to)) onlinePlayers.get(to).inGame = false;
      broadcastOnlinePlayers();
    }
  });

  // Disconnection handling
  socket.on("disconnect", (reason) => {
    if (onlinePlayers.has(user.username)) {
      const playerData = onlinePlayers.get(user.username);

      if (playerData.gameId) {
        const game = activeGames.get(playerData.gameId);
        if (game) {
          const otherPlayer = game.players.find(p => p !== user.username);
          if (otherPlayer) {
            io.to(onlinePlayers.get(otherPlayer).emit("player-disconnected", user.username));
          }
          activeGames.delete(playerData.gameId);
        }
      }

      onlinePlayers.delete(user.username);
      broadcastOnlinePlayers();
    }
  });

  // Helper function to broadcast player list
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
});

const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});