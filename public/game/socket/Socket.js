export class MultiplayerSocket {
  constructor(url = "http://localhost:8000", username) {
    this.socket = io(url, {
      query: { username },
    });

    this.socket.on("connect", () => {
      console.log("Connected to server");
      this.socket.emit("getGameState");
    });

    this.socket.onAny((event, ...args) => {
      console.log(`Client Event: ${event} | Data:`, args);
    });
  }

  onGameStart(callback) {
    this.socket.on("gameStart", (data) => {
      console.log("Received game-start event:", data);
      callback(data);
    });
  }

  onOpponentGameState(callback) {
    this.socket.on("opponentGameState", (data) => {
      console.log("Received opponent game state update:", data);
      callback(data);
    });
  }

  onAddLayers(callback) {
    this.socket.on("addLayers", (data) => {
      console.log("Received addLayers event:", data);
      callback(data);
    });
  }

  onOpponentGameOver(callback) {
    this.socket.on("opponentGameOver", (data) => {
      console.log("Received opponent game over:", data);
      callback(data);
    });
  }

  updateGameState(placedBlocks, activeTet) {
    console.log("Sending updateGameState:", { placedBlocks, activeTet });
    this.socket.emit("updateGameState", { placedBlocks, activeTet });
  }

  sendLayers(layers) {
    console.log("Sending addLayers event with layers:", layers);
    this.socket.emit("addLayers", { layers });
  }

  gameover() {
    console.log("Emitting gameOver event");
    this.socket.emit("gameOver");
  }
}
