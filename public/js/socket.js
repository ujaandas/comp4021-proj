const Socket = (function() {
    let socket = null;
    let typingTimeout = null;

    // Store session ID across page loads
    const SESSION_ID_KEY = 'socketSessionId';

    const getSocket = function() {
        return socket;
    };

    const connect = function() {
        // Reuse existing session ID or create new connection
        socket = io({
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            auth: {
                sessionId: localStorage.getItem(SESSION_ID_KEY)
            }
        });

        // Store session ID on first connection
        socket.on('connect', () => {
            if (!localStorage.getItem(SESSION_ID_KEY)) {
                localStorage.setItem(SESSION_ID_KEY, socket.id);
            }
            console.log('Connected with ID:', socket.id);
        });

        // Handle disconnections
        socket.on("disconnect", (reason) => {
            if (reason === "ping timeout") {
                console.warn("Disconnected due to ping timeout - reconnecting...");
                socket.connect(); // Auto-reconnect
            }
        });

        // Clean up before page unload
        window.addEventListener('beforeunload', () => {
            if (socket) {
                socket.disconnect();
            }
        });

        // Your existing event handlers
        socket.on("users", (onlineUsers) => {
            onlineUsers = JSON.parse(onlineUsers);
        });
    };

    const disconnect = function() {
        if (socket) {
            socket.emit("logout");
            localStorage.removeItem(SESSION_ID_KEY); // Clear session ID on logout

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
        connect,
        disconnect
    };
})();