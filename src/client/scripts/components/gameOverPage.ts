import { renderGamePage } from "./gamePage";

interface PlayerScore {
  username: string;
  score: number;
}

export function renderGameOverPage(
  winner: boolean,
  myUsername: string,
  score: number,
  opponentScore: number,
  leaderboard: PlayerScore[] = []
) {
  const appDiv = document.getElementById("app") as HTMLDivElement;
  if (!appDiv) {
    console.error("No element with id 'app' found.");
    return;
  }

  const sortedLeaderboard = [...leaderboard]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  appDiv.innerHTML = `
    <div class="game-over-container">
      <h1 class="game-over-title">Game Over</h1>
      <div class="game-over-result ${winner ? "winner" : "loser"}">
        You ${winner ? "Won!" : "Lost!"}
      </div>
      
      <div class="scores-container">
        <div class="current-match">
          <h2>Match Results</h2>
          <div class="score-summary">
            <div class="player-score ${winner ? "highlight" : ""}">
              <span class="player-name">${myUsername}</span>
              <span class="score-value">${score}</span>
            </div>
            <div class="player-score ${!winner ? "highlight" : ""}">
              <span class="player-name">Opponent</span>
              <span class="score-value">${opponentScore}</span>
            </div>
          </div>
        </div>
        
        <div class="leaderboard">
          <h2>Top Players</h2>
          <div class="leaderboard-list">
            ${sortedLeaderboard
              .map(
                (player, index) => `
              <div class="leaderboard-item ${
                player.username === myUsername ? "current-player" : ""
              }">
                <span class="rank">${index + 1}</span>
                <span class="name">${player.username}</span>
                <span class="score">${player.score}</span>
              </div>
            `
              )
              .join("")}
            ${
              sortedLeaderboard.length === 0
                ? '<div class="no-scores">No leaderboard data available</div>'
                : ""
            }
          </div>
        </div>
      </div>
      
      <div class="game-over-actions">
        <button id="playAgainBtn" class="action-btn">Play Again</button>
        <button id="mainMenuBtn" class="action-btn">Main Menu</button>
      </div>
    </div>
  `;

  const playAgainBtn = document.getElementById("playAgainBtn");
  const mainMenuBtn = document.getElementById("mainMenuBtn");

  if (playAgainBtn) {
    playAgainBtn.addEventListener("click", () => {
      renderGamePage(myUsername);
    });
  }

  if (mainMenuBtn) {
    mainMenuBtn.addEventListener("click", () => {
      // renderMainMenu();
    });
  }
}
