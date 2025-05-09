import { io, Socket } from "socket.io-client";
import { renderGamePage } from "./gamePage";

let socket: Socket;

export interface ILobby {
  id: string;
  player1: string;
  player2: string | null;
}

export function renderLobby(username: string, onLogout: () => void) {
  const html = `
    <div class="lobby">
      <h2>Welcome, ${username}</h2>
      <button id="create-lobby">Create Lobby</button>
      <div id="available-lobbies"></div>
      <button id="logout-button">Logout</button>
    </div>
  `;

  const appDiv = document.getElementById("app") as HTMLDivElement;
  appDiv.innerHTML = html;

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
    socket.emit("createLobby", (lobby: ILobby) => {
      showLobbyView(lobby, username, onLogout);
    });
  });

  const logoutBtn = document.getElementById(
    "logout-button"
  ) as HTMLButtonElement;
  logoutBtn.addEventListener("click", async () => {
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
}

function renderLobbyList(
  lobbies: Array<ILobby>,
  userName: string,
  onLogout: () => void
) {
  const container = document.getElementById("available-lobbies");
  if (!container) return;
  container.innerHTML = "";

  lobbies.forEach((lobby) => {
    const lobbyDiv = document.createElement("div");
    lobbyDiv.textContent = `Lobby ${lobby.id} | Host: ${lobby.player1}`;
    const joinBtn = document.createElement("button");
    joinBtn.textContent = "Join Lobby";

    joinBtn.addEventListener("click", () => {
      joinLobby(lobby.id, userName, onLogout);
    });

    lobbyDiv.appendChild(joinBtn);
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

function showLobbyView(lobby: ILobby, username: string, onLogout: () => void) {
  const appDiv = document.getElementById("app") as HTMLDivElement;
  let buttonsHtml = "";

  if (lobby.player2 !== null && lobby.player1 === username) {
    buttonsHtml += `<button id="start-game">Start Game!</button>`;
  }

  buttonsHtml += `<button id="leave-lobby">Leave Lobby</button>`;

  appDiv.innerHTML = `
    <div class="lobby-view">
      <h2>Lobby ${lobby.id}</h2>
      <p>Player 1: ${lobby.player1}</p>
      <p>Player 2: ${
        lobby.player2 ? lobby.player2 : "Waiting for player 2..."
      }</p>
      ${buttonsHtml}
    </div>
  `;

  const startGameBtn = document.getElementById(
    "start-game"
  ) as HTMLButtonElement;

  if (startGameBtn) {
    startGameBtn.addEventListener("click", () => {
      socket.emit("startGame", lobby.id);
      renderGamePage(username);
    });
  }

  const leaveLobbyBtn = document.getElementById(
    "leave-lobby"
  ) as HTMLButtonElement;
  leaveLobbyBtn.addEventListener("click", () => {
    socket.emit("leaveLobby", lobby.id, (success: boolean) => {
      if (success) {
        socket.emit("getLobbyList");
        renderLobby(username, onLogout);
      } else {
        alert("Could not leave lobby.");
      }
    });
  });
}
