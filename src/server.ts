import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import routes from "./routes";
import { sessionMiddleware } from "./middleware/session";
import socketHandler from "./socket";
import lobbyMatchHandler from "./socket/lobby";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(sessionMiddleware);
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use(routes);
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

socketHandler(io);
lobbyMatchHandler(io);

io.engine.use(sessionMiddleware);

httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
