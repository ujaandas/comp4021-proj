// public/game-over.js

// Game state variables
let currentGameId = null;
let socket = io(); // Ensure socket is initialized

// Add this with other socket event listeners
function initializeSocketListeners() {
    // Existing socket listeners...

    socket.on('redirect', (path) => {
        console.log('Redirecting to:', path);
        window.location.href = path;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeSocketListeners();

    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('gameId');

    if (!gameId) {
        errorMessage.textContent = 'No game session found. Please start a new game.';
        return;
    }
    const playerScoreEl = document.getElementById('player-score');
    const opponentScoreEl = document.getElementById('opponent-score');
    const opponentNameEl = document.getElementById('opponent-name');
    const highScoresList = document.getElementById('high-scores-list');
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');


    async function loadGameData() {
        try {
            loadingMessage.textContent = 'Loading results...';

            const response = await fetch(`/api/game-over-data?gameId=${gameId}`);
            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            // Update game results
            if (data.lastGame) {
                playerScoreEl.textContent = data.lastGame.myScore;
                opponentScoreEl.textContent = data.lastGame.opponentScore;
                opponentNameEl.textContent = data.lastGame.opponent;
            }

            // Update high scores
            highScoresList.innerHTML = data.highScores.map(user => `
                <li class="high-score-item">
                    <span class="avatar">${user.avatar}</span>
                    <div class="score-info">
                        <span class="name">${user.name}</span>
                        <span class="username">@${user.username}</span>
                    </div>
                    <span class="score">${user.highScore} points</span>
                </li>
            `).join('');

            loadingMessage.textContent = '';
        } catch (error) {
            console.error('Error loading game data:', error);
            errorMessage.textContent = 'Failed to load game results. Please try again later.';
            loadingMessage.textContent = '';
        }
    }

    // Initial load
    loadGameData();
});