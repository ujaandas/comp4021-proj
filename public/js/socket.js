const Socket = (function() {
    let socket = null;
    let typingTimeout = null;

    // This function gets the socket from the module
    const getSocket = function() {
        return socket;
    };

    // This function connects the server and initializes the socket
    const connect = function() {
        socket = io();

        // Wait for the socket to connect successfully
        socket.on("connect", () => {
            // Get the online user list
            socket.emit("get users");

            // Get the chatroom messages
            socket.emit("get messages");
        });

        // Set up the users event
        socket.on("users", (onlineUsers) => {
            onlineUsers = JSON.parse(onlineUsers);
            OnlineUsersPanel.update(onlineUsers);
        });

        // Set up the add user event
        socket.on("add user", (user) => {
            user = JSON.parse(user);
            OnlineUsersPanel.addUser(user);
        });

        // Set up the remove user event
        socket.on("remove user", (user) => {
            user = JSON.parse(user);
            OnlineUsersPanel.removeUser(user);
        });
    };

    // This function disconnects the socket from the server
    const disconnect = function() {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
        clearTimeout(typingTimeout);
    };

    return {
        getSocket,
        connect,
        disconnect,
        postMessage
    };
})();