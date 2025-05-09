const express = require("express");
const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");

// Create the Express app
const app = express();

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const chatSession = session({
  secret: "game",
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: { maxAge: 300000 }
});
app.use(chatSession);

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
  return /^\w+$/.test(text);
}

// Handle the /register endpoint
app.post("/register", (req, res) => {
  // Get the JSON data from the body
  const { username, avatar, name, password } = req.body;

  // Reading the users.json file
  const users = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));

  // Checking for the user data correctness
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
    return res.json({ status: "error", error: "Username already exists" });
  }

  // Adding the new user account
  const hash = bcrypt.hashSync(password, 10);
  users[username] = {
    avatar: avatar,
    name: name,
    password: hash
  };

  // Saving the users.json file
  fs.writeFileSync("./data/users.json", JSON.stringify(users, null, 2));

  // Sending a success response to the browser
  res.json({ status: "success" });
});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
  // Get the JSON data from the body
  const { username, password } = req.body;

  // Reading the users.json file
  const users = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));

  // Checking for username/password
  if (!users[username]) {
    return res.json({ status: "error", error: "Invalid username or password" });
  }

  if (!bcrypt.compareSync(password, users[username].password)) {
    return res.json({ status: "error", error: "Invalid username or password" });
  }

  // Sending a success response with the user account
  const user = {
    username: username,
    avatar: users[username].avatar,
    name: users[username].name
  };

  req.session.user = user;
  res.json({ status: "success", user: user });
});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {
  const user = req.session.user;
  if (user) {
    res.json({ status: "success", user: user });
  } else {
    res.json({ status: "error", error: "No user signed in" });
  }
});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {
  delete req.session.user;
  res.json({ status: "success" });
});

// Create HTTP server for Socket.IO
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);

// Store online users
const onlineUsers = {};

// Use session middleware with Socket.IO
io.use((socket, next) => {
  chatSession(socket.request, {}, next);
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  // Get user from session
  const user = socket.request.session.user;

  // Add user to online list if authenticated
  if (user) {
    onlineUsers[user.username] = {
      socketId: socket.id,
      avatar: user.avatar,
      name: user.name
    };

    // Broadcast new user to all clients
    io.emit('add user', JSON.stringify(user));
    console.log("User connected:", user.username);

    // Handle get users request
    socket.on('get users', () => {
      socket.emit('users', JSON.stringify(onlineUsers));
    });

    // Handle get messages request
    socket.on('get messages', () => {
      const chatroom = JSON.parse(fs.readFileSync('./data/chatroom.json', 'utf8'));
      socket.emit('messages', JSON.stringify(chatroom));
    });


    // Handle game invitations
    socket.on('game invite', (inviteData) => {
      console.log('Game invite received:', inviteData);

      // Verify data structure
      if (!inviteData.to) {
        console.error('Invalid invite format - missing "to" field');
        return;
      }

      const recipient = onlineUsers[inviteData.to];
      if (!recipient) {
        console.error('Recipient not found:', inviteData.to);
        return;
      }

      console.log(`Routing invite from ${inviteData.from} to ${inviteData.to}`);

      // Send to recipient's socket - no need to JSON.stringify here
      io.to(recipient.socketId).emit('game invite', {
        from: inviteData.from,
        name: inviteData.name,
        avatar: inviteData.avatar
      });
    });

    // Handle game invitation responses
    socket.on('game invite response', (data) => {
      const response = JSON.parse(data);
      console.log(`Game invite response from ${user.username} to ${response.to}: ${response.accepted}`);

      // Find the original inviter's socket
      const inviter = onlineUsers[response.to];
      if (inviter) {
        io.to(inviter.socketId).emit('game invite response', JSON.stringify({
          from: user.username,
          accepted: response.accepted,
          name: user.name,
          avatar: user.avatar
        }));
      }
    });

    // Handle game state updates (for multiplayer sync)
    socket.on('game update', (data) => {
      const gameData = JSON.parse(data);
      const opponent = onlineUsers[gameData.to];

      if (opponent) {
        io.to(opponent.socketId).emit('game update', JSON.stringify({
          from: user.username,
          gameState: gameData.gameState,
          score: gameData.score
        }));
      }
    });

    // Handle typing indicator
    socket.on('typing', () => {
      if (user) {
        socket.broadcast.emit('user typing', JSON.stringify({
          user: {
            username: user.username,
            avatar: user.avatar,
            name: user.name
          }
        }));
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (user) {
        delete onlineUsers[user.username];
        // Broadcast user removal to all clients
        io.emit('remove user', JSON.stringify(user));
        console.log("User disconnected:", user.username);
      }
    });
  }
});

// Start the server
httpServer.listen(8000, () => {
  console.log("The game server has started on port 8000...");
});