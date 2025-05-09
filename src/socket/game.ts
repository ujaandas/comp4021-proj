import { Server as SocketIOServer, Socket } from "socket.io";
import { SocketRequest } from ".";

export default function gameHandler(io: SocketIOServer) {
  io.on("connection", (socket: Socket) => {
    const req = socket.request as SocketRequest;
    if (!req.session || !req.session.user) {
      return socket.disconnect(true);
    }
    const username = req.session.user.username;

    socket.on("startGame", (roomId: string) => {
      console.log(`Game started in room: ${roomId}`);
      io.to(roomId).emit("startGame", username);
    });

    socket.on("updateBlocks", (data: { block: string; username: string }) => {
      console.log(`Emitting block from ${data.username}`);
      socket.broadcast.emit("updateBlocks", data);
    });

    socket.on("updateScore", (data: { score: number; username: string }) => {
      console.log(`Emitting score: ${data.score} from ${data.username}`);
      socket.broadcast.emit("scoreUpdate", data);
    });

    socket.on("sendLayers", (data: { clearable: number; username: string }) => {
      console.log(`Emitting layers: ${data.clearable} from ${data.username}`);
      socket.broadcast.emit(
        `layersUpdate ${data.clearable} from ${data.username}`
      );
    });

    socket.on(
      "gameOver",
      (data: { username: string; myScore: number; opponentScore: number }) => {
        console.log(`Game over emitted by ${data.username}`);

        socket.broadcast.emit("gameOver", {
          winner: data.myScore > data.opponentScore,
          ...data,
        });
      }
    );

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${username}`);
      socket.broadcast.emit("userDisconnected", { username });
    });
  });
}
