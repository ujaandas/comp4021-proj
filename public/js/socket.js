const Socket = (function() {
    let socket = null;
    let typingTimeout = null;

    const getSocket = function() {
        return socket;
    };

    const connect = function() {
        socket = io();

        socket.on("connect", () => {
            socket.emit("get users");
        });

        socket.on("users", (onlineUsers) => {
            onlineUsers = JSON.parse(onlineUsers);
        });
    };

    const disconnect = function() {
        if (socket) {
            socket.emit("logout");

            setTimeout(() => {
                socket.disconnect();
                socket = null;
            }, 100);
        }
        clearTimeout(typingTimeout);
    };

    // Return public methods
    return {
        getSocket,
        connect,  // Now properly exposed
        disconnect
    };
})();  // Correctly closed