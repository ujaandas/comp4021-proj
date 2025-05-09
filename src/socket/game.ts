import { Server as SocketIOServer, Socket } from "socket.io";
import { SocketRequest } from ".";

export default function gameHandler(io: SocketIOServer) {
  io.on("connection", (socket: Socket) => {
    const req = socket.request as SocketRequest;
    if (!req.session || !req.session.user) {
      return socket.disconnect(true);
    }
    const username = req.session.user.username;

    socket.on(
      "joinGame",
      (roomId: string, callback: (success: boolean) => void) => {
        socket.join(roomId);
        io.to(roomId).emit("playerJoined", { username });
        callback(true);
      }
    );

    socket.on("startGame", (roomId: string) => {
      io.to(roomId).emit("startGame");
    });

    socket.on("updateTileset", (data: any) => {
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          io.to(room).emit("updateTileset", data);
        }
      });
    });

    socket.on("updateScore", (score: number) => {
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          io.to(room).emit("scoreUpdate", score);
        }
      });
    });

    socket.on("sendLayers", (clearable: number) => {
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          io.to(room).emit("sendLayers", clearable);
        }
      });
    });

    socket.on("gameOver", () => {
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          io.to(room).emit("endGame", { winner: false });
        }
      });
    });

    socket.on("winGame", () => {
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          io.to(room).emit("endGame", { winner: true });
        }
      });
    });

    socket.on("disconnect", () => {
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          io.to(room).emit("playerLeft", { username });
        }
      });
    });
  });
}
