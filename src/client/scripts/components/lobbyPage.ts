import { io, Socket } from "socket.io-client";
import { renderGamePage } from "./gamePage";
import music from "./assets/elevator.mp3";

let socket: Socket;

export interface ILobby {
  id: string;
  player1: string;
  player2: string | null;
}

const lobbyStyles = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
    
    .tetris-lobby {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: 'Press Start 2P', cursive;
      color: white;
      background-color: #0f0f1a;
      min-height: 100vh;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #4cc9f0;
      padding-bottom: 15px;
    }
    
    .logo {
      color: #ff4754;
      text-shadow: 0 0 10px #ff4754;
      font-size: 2.5rem;
      margin: 0;
    }
    
    .player-info {
      display: flex;
      align-items: center;
      gap: 15px;
      font-size: 0.8rem;
    }
    
    .lobby-content {
      display: flex;
      gap: 30px;
    }
    
    .action-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .lobby-list-container {
      flex: 2;
    }
    
    .lobby-list-container h2 {
      color: #4cc9f0;
      font-size: 1.2rem;
      margin-bottom: 15px;
      text-align: center;
    }
    
    .lobby-list {
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid #4cc9f0;
      border-radius: 5px;
      padding: 10px;
      max-height: 400px;
      overflow-y: auto;
    }
    
    .lobby-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      margin-bottom: 10px;
      background: rgba(76, 201, 240, 0.1);
      border: 1px solid #4cc9f0;
      font-size: 0.8rem;
    }
    
    .lobby-item:last-child {
      margin-bottom: 0;
    }
    
    .lobby-info {
      flex-grow: 1;
    }
    
    .lobby-info strong {
      color: #4cc9f0;
    }
    
    .pixel-button {
      background: #4cc9f0;
      color: black;
      border: none;
      padding: 10px 20px;
      font-family: 'Press Start 2P', cursive;
      font-size: 0.8rem;
      cursor: pointer;
      position: relative;
      text-transform: uppercase;
      transition: all 0.2s;
    }
    
    .pixel-button:hover {
      background: #3ab0d6;
    }
    
    .pixel-button.large {
      padding: 15px 30px;
      font-size: 1rem;
    }
    
    .pixel-button::before {
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
    
    .pixel-button:hover::before {
      top: 2px;
      left: 2px;
    }
    
    .tetris-blocks {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 30px;
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
    
    /* Lobby view specific styles */
    .lobby-view {
      background: rgba(15, 15, 26, 0.9);
      border: 2px solid #4cc9f0;
      padding: 20px;
      margin-top: 20px;
      text-align: center;
    }
    
    .lobby-view h2 {
      color: #4cc9f0;
      margin-bottom: 20px;
    }
    
    .lobby-view p {
      margin: 15px 0;
      font-size: 0.9rem;
    }
    
    #start-game {
      background-color: #00f000;
      margin: 20px auto;
      display: block;
    }
    
    #start-game:hover {
      background-color: #00c000;
    }
    
    /* Scrollbar styling */
    .lobby-list::-webkit-scrollbar {
      width: 8px;
    }
    
    .lobby-list::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.2);
    }
    
    .lobby-list::-webkit-scrollbar-thumb {
      background: #4cc9f0;
      border-radius: 4px;
    }
  </style>
`;

export function renderLobby(username: string, onLogout: () => void) {
  const html = `
    <div class="tetris-lobby">
      <div class="header">
        <h1 class="logo">t3dtris</h1>
        <div class="player-info">
          <span>Player: <strong>${username}</strong></span>
          <button id="logout-button" class="pixel-button">Logout</button>
        </div>
      </div>
      
      <div class="lobby-content">
        <div class="action-panel">
          <button id="create-lobby" class="pixel-button large">Create Lobby</button>
        </div>
        
        <div class="lobby-list-container">
          <h2>Available Games</h2>
          <div id="available-lobbies" class="lobby-list"></div>
        </div>
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

  const appDiv = document.getElementById("app") as HTMLDivElement;
  appDiv.innerHTML = html + lobbyStyles;

  const backgroundMusic = new Audio(music);
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.05;

  backgroundMusic
    .play()
    .catch((err) => console.error("Error playing background music:", err));

  function stopMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    backgroundMusic.volume = 0;
  }

  socket = io();

  socket.on("startGame", (lobby: ILobby) => {
    console.log("Game started in lobby:", lobby);
    renderGamePage(username);
  });

  socket.on("lobbyList", (lobbies: Array<ILobby>) => {
    renderLobbyList(lobbies, username, onLogout);
  });

  const createBtn = document.getElementById(
    "create-lobby"
  ) as HTMLButtonElement;
  createBtn.addEventListener("click", () => {
    stopMusic();
    socket.emit("createLobby", (lobby: ILobby) => {
      showLobbyView(lobby, username, onLogout);
    });
  });

  const logoutBtn = document.getElementById(
    "logout-button"
  ) as HTMLButtonElement;
  logoutBtn.addEventListener("click", async () => {
    stopMusic();
    try {
      const res = await fetch("/auth/logout", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        socket.disconnect();
        onLogout();
      } else {
        alert("Logout failed.");
      }
    } catch (error) {
      alert("Error during logout.");
    }
  });

  socket.on("lobbyJoined", (lobby: ILobby) => {
    showLobbyView(lobby, username, onLogout);
  });

  function renderLobbyList(
    lobbies: Array<ILobby>,
    userName: string,
    onLogout: () => void
  ) {
    const container = document.getElementById("available-lobbies");
    if (!container) return;
    container.innerHTML = "";

    if (lobbies.length === 0) {
      container.innerHTML =
        '<div class="no-lobbies">No games available. Create one!</div>';
      return;
    }

    lobbies.forEach((lobby) => {
      const lobbyDiv = document.createElement("div");
      lobbyDiv.className = "lobby-item";

      lobbyDiv.innerHTML = `
        <div class="lobby-info">
          <strong>Game ${lobby.id}</strong><br>
          <span>Host: ${lobby.player1}</span>
          ${
            lobby.player2
              ? "<span> vs ${lobby.player2}</span>"
              : "<span>Waiting for opponent</span>"
          }
        </div>
        <button class="pixel-button">${
          lobby.player2 ? "Spectate" : "Join"
        }</button>
      `;

      const joinBtn = lobbyDiv.querySelector("button") as HTMLButtonElement;
      joinBtn.addEventListener("click", () => {
        joinLobby(lobby.id, userName, onLogout);
      });

      container.appendChild(lobbyDiv);
    });
  }

  function joinLobby(lobbyId: string, username: string, onLogout: () => void) {
    socket.emit("joinLobby", lobbyId, (lobby: ILobby | null) => {
      if (lobby) {
        showLobbyView(lobby, username, onLogout);
      } else {
        alert("Unable to join lobby or lobby is full.");
      }
    });
  }

  function showLobbyView(
    lobby: ILobby,
    username: string,
    onLogout: () => void
  ) {
    const appDiv = document.getElementById("app") as HTMLDivElement;

    let buttonsHtml = "";
    if (lobby.player2 !== null && lobby.player1 === username) {
      buttonsHtml = `<button id="start-game" class="pixel-button large">Start Game</button>`;
    }

    buttonsHtml += `<button id="leave-lobby" class="pixel-button">Leave Lobby</button>`;

    appDiv.innerHTML = `
      <div class="tetris-lobby">
        <div class="header">
          <h1 class="logo">t3dtris</h1>
          <div class="player-info">
            <span>Player: <strong>${username}</strong></span>
            <button id="logout-button" class="pixel-button">Logout</button>
          </div>
        </div>
        
        <div class="lobby-view">
          <h2>Game ${lobby.id}</h2>
          <p>Player 1: ${lobby.player1}</p>
          <p>Player 2: ${lobby.player2 || "Waiting..."}</p>
          ${buttonsHtml}
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
      ${lobbyStyles}
    `;

    const startGameBtn = document.getElementById(
      "start-game"
    ) as HTMLButtonElement;
    if (startGameBtn) {
      stopMusic();
      startGameBtn.addEventListener("click", () => {
        stopMusic();
        socket.emit("startGame", lobby.id);
        stopMusic();
        renderGamePage(username);
        stopMusic();
      });
    }

    const leaveLobbyBtn = document.getElementById(
      "leave-lobby"
    ) as HTMLButtonElement;
    leaveLobbyBtn.addEventListener("click", () => {
      stopMusic();
      socket.emit("leaveLobby", lobby.id, (success: boolean) => {
        if (success) {
          stopMusic();
          socket.emit("getLobbyList");
          renderLobby(username, onLogout);
        } else {
          stopMusic();
          alert("Could not leave lobby.");
        }
      });
    });

    const logoutBtn = document.getElementById(
      "logout-button"
    ) as HTMLButtonElement;
    logoutBtn.addEventListener("click", async () => {
      stopMusic();
      try {
        const res = await fetch("/auth/logout", { method: "POST" });
        const data = await res.json();
        if (data.success) {
          socket.disconnect();
          onLogout();
        } else {
          alert("Logout failed.");
        }
      } catch (error) {
        alert("Error during logout.");
      }
    });
  }
}
