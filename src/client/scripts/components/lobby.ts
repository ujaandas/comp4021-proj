import { io, Socket } from "socket.io-client";

let socket: Socket;

interface ILobby {
  id: string;
  player1: string;
  player2: string | null;
}

export function renderLobby(userName: string, onLogout: () => void) {
  const html = `
    <div class="lobby">
      <h2>Welcome, ${userName}</h2>
      <button id="create-lobby">Create Lobby</button>
      <div id="available-lobbies"></div>
      <button id="logout-button">Logout</button>
    </div>
  `;
  const appDiv = document.getElementById("app") as HTMLDivElement;
  appDiv.innerHTML = html;

  socket = io();

  socket.on("lobbyList", (lobbies: Array<ILobby>) => {
    renderLobbyList(lobbies);
  });

  const createBtn = document.getElementById(
    "create-lobby"
  ) as HTMLButtonElement;
  createBtn.addEventListener("click", () => {
    console.log("Creating lobby...");
    socket.emit(
      "createLobby",
      (lobby: { id: string; player1: string; player2: string | null }) => {
        showLobbyView(lobby);
      }
    );
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

  socket.on(
    "lobbyJoined",
    (lobby: { id: string; player1: string; player2: string | null }) => {
      showLobbyView(lobby);
    }
  );
}

function renderLobbyList(
  lobbies: Array<{ id: string; player1: string; player2: string | null }>
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
      joinLobby(lobby.id);
    });

    lobbyDiv.appendChild(joinBtn);
    container.appendChild(lobbyDiv);
  });
}

function joinLobby(lobbyId: string) {
  socket.emit("joinLobby", lobbyId, (lobby: ILobby | null) => {
    if (lobby) {
      showLobbyView(lobby);
    } else {
      alert("Unable to join lobby or lobby is full.");
    }
  });
}

function showLobbyView(lobby: {
  id: string;
  player1: string;
  player2: string | null;
}) {
  const appDiv = document.getElementById("app") as HTMLDivElement;
  appDiv.innerHTML = `
    <div class="lobby-view">
      <h2>Lobby ${lobby.id}</h2>
      <p>Player 1: ${lobby.player1}</p>
      <p>Player 2: ${
        lobby.player2 ? lobby.player2 : "Waiting for player 2..."
      }</p>
    </div>
  `;
}
