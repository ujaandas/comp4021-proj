import { Server as SocketIOServer } from "socket.io";
import { ICustomSession } from "../routes/auth";
import { IncomingMessage } from "http";

interface SocketRequest extends IncomingMessage {
  session?: ICustomSession;
}

export default function socketHandler(io: SocketIOServer) {
  io.on("connection", (socket) => {
    const req = socket.request as SocketRequest;
    console.log("Socket connected. User:", req?.session?.user);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}
