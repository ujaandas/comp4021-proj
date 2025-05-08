export class MultiplayerSocket {
  constructor(url = "http://localhost:8000") {
    this.socket = io(url);

    this.socket.on("connect", () => {
      console.log("Connected to server");
      this.socket.emit("getGameState");
    });

    this.socket.on("gameState", (data) => {
      console.log("Received game state from server:", data);
    });
  }

  onGameStart(callback) {
    this.socket.on("game-start", (data) => {
      callback(data);
    });
  }

  onOpponentGameState(callback) {
    this.socket.on("opponentGameState", (data) => {
      callback(data);
    });
  }

  onAddLayers(callback) {
    this.socket.on("addLayers", (data) => {
      callback(data);
    });
  }

  onOpponentGameOver(callback) {
    this.socket.on("opponentGameOver", (data) => {
      callback(data);
    });
  }

  updateGameState(placedBlocks, activeTet) {
    this.socket.emit("updateGameState", { placedBlocks, activeTet });
  }

  sendLayers(layers) {
    this.socket.emit("addLayers", { layers });
  }

  gameover() {
    this.socket.emit("gameOver");
  }
}
