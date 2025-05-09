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
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      
      .game-over-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        font-family: 'Press Start 2P', cursive;
        color: white;
        background-color: #0f0f1a;
        min-height: 100vh;
        text-align: center;
      }
      
      .game-over-title {
        color: #ff4754;
        text-shadow: 0 0 10px #ff4754;
        font-size: 2.5rem;
        margin-bottom: 30px;
      }
      
      .game-over-result {
        font-size: 2rem;
        margin-bottom: 40px;
        padding: 15px;
        border: 4px solid;
        border-radius: 8px;
      }
      
      .game-over-result.winner {
        color: #00f000;
        border-color: #00f000;
        text-shadow: 0 0 10px #00f000;
      }
      
      .game-over-result.loser {
        color: #f00000;
        border-color: #f00000;
        text-shadow: 0 0 10px #f00000;
      }
      
      .scores-container {
        display: flex;
        gap: 30px;
        margin-bottom: 40px;
        justify-content: center;
      }
      
      .current-match, .leaderboard {
        flex: 1;
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid #4cc9f0;
        border-radius: 5px;
        padding: 15px;
      }
      
      h2 {
        color: #4cc9f0;
        font-size: 1.2rem;
        margin-bottom: 20px;
      }
      
      .score-summary {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      .player-score {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        font-size: 0.9rem;
      }
      
      .player-score.highlight {
        background: rgba(76, 201, 240, 0.2);
        border: 1px solid #4cc9f0;
      }
      
      .leaderboard-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .leaderboard-item {
        display: flex;
        justify-content: space-between;
        padding: 8px;
        font-size: 0.8rem;
        background: rgba(255, 255, 255, 0.03);
      }
      
      .leaderboard-item.current-player {
        background: rgba(76, 201, 240, 0.2);
        border: 1px solid #4cc9f0;
      }
      
      .game-over-actions {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 30px;
      }
      
      .action-btn {
        background: #4cc9f0;
        color: black;
        border: none;
        padding: 12px 25px;
        font-family: 'Press Start 2P', cursive;
        font-size: 0.9rem;
        cursor: pointer;
        position: relative;
        text-transform: uppercase;
        transition: all 0.2s;
      }
      
      .action-btn:hover {
        background: #3ab0d6;
      }
      
      .action-btn::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        border: 2px solid white;
        top: 4px;
        left: 4px;
        z-index: -1;
        transition: all 0.2s;
      }
      
      .action-btn:hover::before {
        top: 2px;
        left: 2px;
      }
      
      .tetris-blocks {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 40px;
        opacity: 0.7;
      }
      
      .block {
        width: 30px;
        height: 30px;
      }
      
      .i-block { background-color: #00f0f0; }
      .o-block { background-color: #f0f000; }
      .t-block { background-color: #a000f0; }
      .l-block { background-color: #f0a000; }
      .j-block { background-color: #0000f0; }
      .s-block { background-color: #00f000; }
      .z-block { background-color: #f00000; }
    </style>
    
    <div class="game-over-container">
      <h1 class="game-over-title">GAME OVER</h1>
      <div class="game-over-result ${winner ? "winner" : "loser"}">
        YOU ${winner ? "WON!" : "LOST!"}
      </div>
      
      <div class="scores-container">
        <div class="current-match">
          <h2>MATCH RESULTS</h2>
          <div class="score-summary">
            <div class="player-score ${winner ? "highlight" : ""}">
              <span class="player-name">${myUsername.toUpperCase()}</span>
              <span class="score-value">${score}</span>
            </div>
            <div class="player-score ${!winner ? "highlight" : ""}">
              <span class="player-name">OPPONENT</span>
              <span class="score-value">${opponentScore}</span>
            </div>
          </div>
        </div>
        
        <div class="leaderboard">
          <h2>TOP PLAYERS</h2>
          <div class="leaderboard-list">
            ${sortedLeaderboard
              .map(
                (player, index) => `
              <div class="leaderboard-item ${
                player.username === myUsername ? "current-player" : ""
              }">
                <span class="rank">${index + 1}</span>
                <span class="name">${player.username.toUpperCase()}</span>
                <span class="score">${player.score}</span>
              </div>
            `
              )
              .join("")}
            ${
              sortedLeaderboard.length === 0
                ? '<div class="no-scores">NO LEADERBOARD DATA</div>'
                : ""
            }
          </div>
        </div>
      </div>
      
      <div class="game-over-actions">
        <button id="playAgainBtn" class="action-btn">PLAY AGAIN</button>
        <button id="mainMenuBtn" class="action-btn">MAIN MENU</button>
      </div>
      
      <div class="tetris-blocks">
        <div class="block i-block"></div>
        <div class="block o-block"></div>
        <div class="block t-block"></div>
        <div class="block l-block"></div>
        <div class="block j-block"></div>
        <div class="block s-block"></div>
        <div class="block z-block"></div>
      </div>
    </div>
  `;

  // const backgroundMusic = new Audio(music);
  // backgroundMusic.loop = true;
  // backgroundMusic.volume = 0.3;

  // backgroundMusic
  //   .play()
  //   .catch((err) => console.error("Error playing background music:", err));

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
