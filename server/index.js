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

  //
  // D. Reading the users.json file
  //
  const users = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));

  //
  // E. Checking for the user data correctness
  //
  // 1. Check if any field is empty
  if (!username || !avatar || !name || !password) {
    return res.json({ status: "error", error: "All fields are required" });
  }

  // 2. Check username contains only word characters
  if (!containWordCharsOnly(username)) {
    return res.json({
      status: "error",
      error: "Username can only contain letters, numbers, or underscores"
    });
  }

  // 3. Check if username already exists
  if (users[username]) {
    return res.json({ status: "error", error: "Username already exists" });
  }

  //
  // G. Adding the new user account
  //
  // Hash the password before storing
  const hash = bcrypt.hashSync(password, 10);

  // Create new user object
  users[username] = {
    avatar: avatar,
    name: name,
    password: hash  // Store the hashed password, not the plain text
  };

  //
  // H. Saving the users.json file
  //
  fs.writeFileSync("./data/users.json", JSON.stringify(users, null, 2));

  //
  // I. Sending a success response to the browser
  //
  res.json({ status: "success" });
});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
  // Get the JSON data from the body
  const { username, password } = req.body;

  //
  // D. Reading the users.json file
  //
  const users = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));

  //
  // E. Checking for username/password
  //
  if (!users[username]) {
    return res.json({ status: "error", error: "Invalid username or password" });
  }

  if (!bcrypt.compareSync(password, users[username].password)) {
    return res.json({ status: "error", error: "Invalid username or password" });
  }

  //
  // G. Sending a success response with the user account
  //
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

  //
  // B. Getting req.session.user
  //
  const user = req.session.user;

  //
  // D. Sending a success response with the user account
  //
  if (user) {
    res.json({ status: "success", user: user });
  } else {
    res.json({ status: "error", error: "No user signed in" });
  }

});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {

  //
  // Deleting req.session.user
  //
  delete req.session.user;

  //
  // Sending a success response
  //
  res.json({ status: "success" });
});


// ***** Lab 6 Code - Socket.IO Implementation *****

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
      avatar: user.avatar,
      name: user.name
    };

    // Broadcast new user to all clients
    io.emit('add user', JSON.stringify(user));
    console.log(onlineUsers);

    // Handle get users request
    socket.on('get users', () => {
      socket.emit('users', JSON.stringify(onlineUsers));
    });

    // Handle get messages request
    socket.on('get messages', () => {
      const chatroom = JSON.parse(fs.readFileSync('./data/chatroom.json', 'utf8'));
      socket.emit('messages', JSON.stringify(chatroom));
    });

    // Handle new messages
    socket.on('post message', (content) => {
      const chatroom = JSON.parse(fs.readFileSync('./data/chatroom.json', 'utf8'));

      const newMessage = {
        user: {
          username: user.username,
          avatar: user.avatar,
          name: user.name
        },
        datetime: new Date(),
        content: content
      };

      chatroom.push(newMessage);
      fs.writeFileSync('./data/chatroom.json', JSON.stringify(chatroom, null, 2));

      // Broadcast new message to all clients
      io.emit('add message', JSON.stringify(newMessage));
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (user) {
        delete onlineUsers[user.username];
        // Broadcast user removal to all clients
        io.emit('remove user', JSON.stringify(user));
        console.log(onlineUsers);
      }
    });

    // Handle typing indicator
    socket.on('typing', () => {
      if (user) {
        // Ensure we're sending properly formatted data
        const typingData = JSON.stringify({
          user: {
            username: user.username,
            avatar: user.avatar,
            name: user.name
          }
        });
        socket.broadcast.emit('user typing', typingData);
      }
    });
  }
});

// Change app.listen to httpServer.listen
httpServer.listen(8000, () => {
  console.log("The chat server has started...");
});