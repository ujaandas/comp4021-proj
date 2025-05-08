export class MultiplayerSocket {
  constructor(url = "") {
    this.socket = io(url); // Use the globally available `io()` function
    this.socket.on("connect", () => {
      this.socket.emit("getGameState");
    });

    this.socket.on("gameState", (data) => {
      console.log("Received game state from server:", data);
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

  on(event, callback) {
    this.socket.on(event, callback);
  }
}
