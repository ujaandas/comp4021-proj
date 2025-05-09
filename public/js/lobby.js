const Lobby = (function() {
    let socket;
    let currentUser;
    let currentGame = null;
    const SESSION_ID_KEY = 'socketSessionId';

    const initialize = function() {
        // Get current user from local storage
        currentUser = localStorage.getItem('username');
        if (!currentUser) {
            window.location.href = '/';
            return;
        }

        $('#lobby-username').text(`Welcome, ${currentUser}`);

        // Connect to socket with session persistence
        socket = io({
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            auth: {
                sessionId: localStorage.getItem(SESSION_ID_KEY),
                username: currentUser
            }
        });

        // Store session ID on first connection
        socket.on('connect', () => {
            if (!localStorage.getItem(SESSION_ID_KEY)) {
                localStorage.setItem(SESSION_ID_KEY, socket.id);
            }
            console.log('Connected with ID:', socket.id);
            socket.emit('enter-lobby', currentUser);
        });

        // Clean up before page unload
        window.addEventListener('beforeunload', () => {
            if (socket && currentUser) {
                socket.emit('leave-lobby', currentUser);
            }
        });

        // Set up event listeners
        setupSocketListeners();
        setupUIListeners();
    };

    const setupSocketListeners = function() {
        // Receive list of online players
        socket.on('online-players', (players) => {
            updateOnlinePlayersList(players);
        });

        // Receive a game request
        socket.on('game-request', (fromUser) => {
            showPendingRequest(fromUser);
        });

        // Game request was accepted - show game UI but don't redirect yet
        socket.on('game-start', ({ opponent, isInitiator, gameId }) => {
            currentGame = {
                opponent,
                isInitiator,
                gameId
            };

            console.log("yo" + currentGame.gameId)
            console.log("yo1" + currentGame.isInitiator)
            console.log("yo2" + currentGame.gameId)

            $('.online-players-section, #pending-requests-section').hide();
            $('#active-game-section').show();
            $('#opponent-name').text(opponent);

            if (isInitiator) {
                $('#start-game-btn').show().on('click', startGameHandler);
            } else {
                $('#start-game-btn').hide();
            }
        });

        // Game request was declined
        socket.on('game-declined', (fromUser) => {
            const $playerItem = $(`.player-item[data-username="${fromUser}"]`);
            if ($playerItem.length) {
                const $status = $playerItem.find('.request-status');
                setTimeout(() => {
                    $playerItem.find('.request-btn')
                        .text('Request Game')
                        .prop('disabled', false);
                }, 5000);
                $status.text('Request declined').addClass('error');
            }
        });

        // Handle disconnections
        socket.on('player-disconnected', (username) => {
            if (currentGame && currentGame.opponent === username) {
                alert(`${username} has disconnected. Returning to lobby.`);
                returnToLobby();
            }
        });

        // Handle connection errors
        socket.on('connect_error', (err) => {
            console.error('Connection error:', err.message);
        });

        // Redirect to game when both players are ready
        socket.on('redirect-to-game', ({ gameId }) => {
            sessionStorage.setItem('currentGameId', gameId);
            window.location.href = '/game.html';
        });

        // Handle game errors
        socket.on('game-error', (message) => {
            alert(message);
            returnToLobby();
        });
    };

    const setupUIListeners = function() {
        // Logout button
        $('#lobby-logout-btn').on('click', () => {
            socket.emit('leave-lobby', currentUser);
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem(SESSION_ID_KEY);
            window.location.href = '/';
        });
    };

    const updateOnlinePlayersList = function(players) {
        const $list = $('#online-players-list');

        // Save the current status messages before emptying
        const statusMessages = {};
        $list.find('.player-item').each(function() {
            const username = $(this).data('username');
            const message = $(this).find('.request-status').text();
            const isError = $(this).find('.request-status').hasClass('error');
            if (message) {
                statusMessages[username] = { message, isError };
            }
        });

        $list.empty();

        players.forEach(player => {
            if (player.username !== currentUser && player.inGame !== true) {
                const $playerItem = $(`
                    <div class="player-item" data-username="${player.username}">
                        <span class="player-name">${player.username}</span>
                        <span class="request-status"></span>
                        <button class="request-btn">Request Game</button>
                    </div>
                `);

                // Restore any existing status message
                if (statusMessages[player.username]) {
                    $playerItem.find('.request-status')
                        .text(statusMessages[player.username].message)
                        .toggleClass('error', statusMessages[player.username].isError);
                }

                // Check if we have a pending request to this player
                const existingRequest = $(`.player-item[data-username="${player.username}"] .request-btn:disabled`);
                if (existingRequest.length > 0 || statusMessages[player.username]) {
                    $playerItem.find('.request-btn')
                        .text('Request Sent')
                        .prop('disabled', true);
                }

                $playerItem.find('.request-btn').on('click', () => {
                    socket.emit('game-request', {
                        from: currentUser,
                        to: player.username
                    });
                    $playerItem.find('.request-btn')
                        .text('Request Sent')
                        .prop('disabled', true);
                    $playerItem.find('.request-status')
                        .text('')
                        .removeClass('error');
                });

                $list.append($playerItem);
            }
        });
    };

    const showPendingRequest = function(fromUser) {
        $('#pending-requests-section').show();
        const $requestItem = $(`
            <div class="request-item" data-username="${fromUser}">
                <span class="player-name">${fromUser}</span>
                <span class="request-status"></span>
                <button class="accept-btn">Accept</button>
                <button class="decline-btn">Decline</button>
            </div>
        `);

        $requestItem.find('.accept-btn').on('click', () => {
            socket.emit('game-accept', {
                from: currentUser,
                to: fromUser
            });
            $requestItem.remove();
            if ($('#pending-requests-list').children().length === 0) {
                $('#pending-requests-section').hide();
            }
        });

        $requestItem.find('.decline-btn').on('click', () => {
            socket.emit('game-decline', {
                from: currentUser,
                to: fromUser
            });
            $requestItem.find('.request-status')
                .text('You declined')
                .addClass('error');
            $requestItem.find('.accept-btn, .decline-btn').remove();

            setTimeout(() => {
                $requestItem.remove();
                if ($('#pending-requests-list').children().length === 0) {
                    $('#pending-requests-section').hide();
                }
            }, 5000);
        });

        $('#pending-requests-list').append($requestItem);
    };

    const startGameHandler = function() {
        if (!currentGame) return;
        console.log("currentgame" + currentGame)
        // Notify server we're ready to start
        socket.emit('initiator-ready', {
            gameId: currentGame.gameId
        });
    };

    const returnToLobby = function() {
        currentGame = null;
        socket.emit('leave-game', currentUser);
        socket.emit('enter-lobby', currentUser);

        $('#active-game-section').hide();
        $('.online-players-section').show();
        $('#pending-requests-list').empty();
        $('#pending-requests-section').hide();
    };

    return {
        initialize
    };
})();

$(function() {
    Lobby.initialize();
});