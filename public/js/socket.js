const Socket = (function() {
    let socket = null;

    const connect = function() {
        socket = io();

        // Connection established
        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);
            socket.emit("get users");
        });

        // Users list received
        socket.on("users", (data) => {
            OnlineUsersPanel.update(JSON.parse(data));
        });

        // New user connected
        socket.on("add user", (data) => {
            OnlineUsersPanel.addUser(JSON.parse(data));
        });

        // User disconnected
        socket.on("remove user", (data) => {
            OnlineUsersPanel.removeUser(JSON.parse(data));
        });

// Game invitation received
        socket.on("game invite", (data) => {
            console.log("Received game invite:", data);

            // Store the invitation data for later use
            const invitation = {
                from: data.from,
                name: data.name,
                avatar: data.avatar
            };

            // Show the modal
            const modal = document.getElementById('game-invite-modal');
            const message = document.getElementById('invite-message');
            message.textContent = `${data.name} invites you to play. Accept?`;

            // Remove previous event listeners to avoid duplicates
            document.getElementById('accept-invite').onclick = null;
            document.getElementById('decline-invite').onclick = null;

            // Set up new event listeners
            document.getElementById('accept-invite').onclick = () => {
                modal.classList.add('hidden');
                sendGameInviteResponse(invitation.from, true);
                TetrisGame.startMultiplayer({
                    username: invitation.from,
                    name: invitation.name,
                    avatar: invitation.avatar
                });
            };

            document.getElementById('decline-invite').onclick = () => {
                modal.classList.add('hidden');
                sendGameInviteResponse(invitation.from, false);
            };

            // Show the modal
            modal.classList.remove('hidden');
        });
        // Game invitation response received
// Game invitation response received
        socket.on('game invite response', function(data) {
            const response = JSON.parse(data);
            console.log("Received game invite response:", response);

            const toast = document.getElementById('notification-toast');

            if (response.accepted) {
                toast.textContent = `Your game invitation to ${response.name} was accepted!`;
                // Start the game
                TetrisGame.startMultiplayer({
                    username: response.from,
                    name: response.name,
                    avatar: response.avatar
                });
            } else {
                toast.textContent = `Your game invitation to ${response.name} was declined.`;
            }

            // Show the toast
            toast.classList.add('show');
            toast.classList.remove('hidden');

            // Hide after 3 seconds
            setTimeout(() => {
                toast.classList.remove('show');
                toast.classList.add('hidden');
            }, 3000);
        });

        // Game state update received
        socket.on('game update', function(data) {
            const gameData = JSON.parse(data);
            // Update opponent's game state
            //TetrisGame.updateOpponent(gameData);
        });
    };

    const disconnect = function() {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    };

    // Send a game invitation to another user
    const sendGameInvite = function(username) {
        if (!socket) return;

        const currentUser = Authentication.getUser();
        console.log("Sending game invite to:", username);

        // Send the invitation with proper structure
        socket.emit("game invite", {
            from: currentUser.username,
            to: username,
            name: currentUser.name,
            avatar: currentUser.avatar
        });
    };

    // Send a response to a game invitation
    const sendGameInviteResponse = function(username, accepted) {
        if (!socket) return;

        console.log("Sending game invite response to:", username, "accepted:", accepted);
        socket.emit("game invite response", JSON.stringify({
            to: username,
            accepted: accepted
        }));
    };

    const sendGameUpdate = function(toUsername, gameState, score) {
        if (socket) {
            socket.emit('game update', JSON.stringify({
                to: toUsername,
                gameState: gameState,
                score: score || 0
            }));
        }
    };

    return {
        connect,
        disconnect,
        sendGameInvite,
        sendGameInviteResponse,
        sendGameUpdate
    };
})();