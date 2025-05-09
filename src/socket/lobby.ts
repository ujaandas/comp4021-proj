import { Server as SocketIOServer, Socket } from "socket.io";
import { IncomingMessage } from "http";
import { ICustomSession } from "../routes/auth";
import { ILobby, loadLobbies, saveLobbies } from "../repository/lobby";
import { randomUUID } from "crypto";

interface SocketRequest extends IncomingMessage {
  session?: ICustomSession;
}

let lobbies: ILobby[] = [];
(async () => {
  lobbies = await loadLobbies();
})();

function getAvailableLobbies(): ILobby[] {
  return lobbies.filter((lobby) => !lobby.player2);
}

export default function lobbyMatchHandler(io: SocketIOServer) {
  io.on("connection", (socket: Socket) => {
    const req = socket.request as SocketRequest;
    if (!req.session || !req.session.user) {
      return socket.disconnect(true);
    }
    const username: string = req.session.user.username;
    socket.emit("lobbyList", getAvailableLobbies());

    socket.on("createLobby", async (callback: (result: ILobby) => void) => {
      const newLobby: ILobby = {
        id: randomUUID(),
        player1: username,
        player2: null,
      };
      lobbies.push(newLobby);
      await saveLobbies(lobbies);
      socket.join(newLobby.id);
      callback(newLobby);
      io.emit("lobbyList", getAvailableLobbies());
    });

    socket.on(
      "joinLobby",
      async (lobbyId: string, callback: (result: ILobby | null) => void) => {
        const lobby = lobbies.find((l) => l.id === lobbyId);
        if (lobby && !lobby.player2) {
          lobby.player2 = username;
          await saveLobbies(lobbies);
          socket.join(lobby.id);
          io.to(lobby.id).emit("lobbyJoined", lobby);
          io.emit("lobbyList", getAvailableLobbies());
          callback(lobby);
        } else {
          callback(null);
        }
      }
    );

    socket.on(
      "leaveLobby",
      async (lobbyId: string, callback: (result: boolean) => void) => {
        const lobby = lobbies.find((l) => l.id === lobbyId);
        if (lobby) {
          if (lobby.player1 === username) {
            if (lobby.player2) {
              lobby.player1 = lobby.player2;
              lobby.player2 = null;
            } else {
              lobbies = lobbies.filter((l) => l.id !== lobbyId);
            }
            await saveLobbies(lobbies);
            socket.leave(lobby.id);
            io.to(lobby.id).emit("lobbyLeft", lobbyId);
            io.emit("lobbyList", getAvailableLobbies());
            callback(true);
          } else if (lobby.player2 === username) {
            lobby.player2 = null;
            await saveLobbies(lobbies);
            socket.leave(lobby.id);
            io.to(lobby.id).emit("lobbyLeft", lobbyId);
            io.emit("lobbyList", getAvailableLobbies());
            callback(true);
          } else {
            callback(false);
          }
        } else {
          callback(false);
        }
      }
    );

    socket.on("disconnect", async () => {
      const affected = lobbies.filter(
        (l) => l.player1 === username || l.player2 === username
      );
      for (const lobby of affected) {
        if (lobby.player1 === username) {
          if (lobby.player2) {
            lobby.player1 = lobby.player2;
            lobby.player2 = null;
          } else {
            lobbies = lobbies.filter((l) => l.id !== lobby.id);
          }
        } else if (lobby.player2 === username) {
          lobby.player2 = null;
        }
        socket.leave(lobby.id);
      }
      await saveLobbies(lobbies);
      io.emit("lobbyList", getAvailableLobbies());
    });
  });
}
