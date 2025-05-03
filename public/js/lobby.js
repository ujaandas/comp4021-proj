const Lobby = (function() {
    let socket;
    let currentUser;
    let currentGame = null;

    const initialize = function() {
        // Get current user from local storage
        currentUser = localStorage.getItem('username');
        if (!currentUser) {
            window.location.href = '/';
            return;
        }

        $('#lobby-username').text(`Welcome, ${currentUser}`);

        // Connect to socket
        socket = io.connect();

        // Set up event listeners
        setupSocketListeners();
        setupUIListeners();

        // Notify server we're in the lobby
        socket.emit('enter-lobby', currentUser);
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

        // Game request was accepted
        socket.on('game-start', ({ opponent, isInitiator }) => {
            startGameWithOpponent(opponent, isInitiator);
        });

        socket.on('game-declined', (fromUser) => {
            const $playerItem = $(`.player-item[data-username="${fromUser}"]`);
            if ($playerItem.length) {
                const $status = $playerItem.find('.request-status');
                // Re-enable the request button after a delay
                setTimeout(() => {
                    $playerItem.find('.request-btn')
                        .text('Request Game')
                        .prop('disabled', false);
                }, 5000);
                // Show the decline message
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

    };

    const setupUIListeners = function() {
        // Logout button
        $('#lobby-logout-btn').on('click', () => {
            socket.emit('leave-lobby', currentUser);
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            window.location.href = '/';
        });

        // Start game button
        $('#start-game-btn').on('click', () => {
            if (currentGame && currentGame.isInitiator) {
                socket.emit('game-ready', {
                    from: currentUser,
                    to: currentGame.opponent
                });
                // Redirect to game page
                window.location.href = '/game.html';
            }
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

            // Auto-remove after 5 seconds if you want, or keep it persistent
            setTimeout(() => {
                $requestItem.remove();
                if ($('#pending-requests-list').children().length === 0) {
                    $('#pending-requests-section').hide();
                }
            }, 5000);
        });

        $('#pending-requests-list').append($requestItem);
    };

    const startGameWithOpponent = function(opponent, isInitiator) {
        currentGame = {
            opponent,
            isInitiator
        };

        $('.online-players-section, #pending-requests-section').hide();
        $('#active-game-section').show();
        $('#opponent-name').text(opponent);

        if (!isInitiator) {
            $('#start-game-btn').hide();
        }
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