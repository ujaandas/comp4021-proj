import { InputHandler } from "../game/utils/InputHandler.js";
import { Renderer } from "../game/render/Renderer.js";
import { Tileset } from "../game/tileset/Tileset.js";
import { Camera } from "../game/utils/Camera.js";
import { Settings } from "../game/utils/Settings.js";
import { GameTimer } from "../game/utils/GameTimer.js";
import { TetrominoGenerator } from "../game/utils/TetGenerator.js";
import { MultiplayerSocket } from "../game/socket/Socket.js";

window.onload = function () {
  const localCanvas = document.getElementById("localCanvas");
  const opponentCanvas = document.getElementById("opponentCanvas");

  const localCtx = localCanvas.getContext("2d");
  const opponentCtx = opponentCanvas.getContext("2d");

  if (!localCtx || !opponentCtx) return;

  localCanvas.width = window.innerWidth / 2;
  localCanvas.height = window.innerHeight;

  opponentCanvas.width = window.innerWidth / 2;
  opponentCanvas.height = window.innerHeight;

  const mpSocket = new MultiplayerSocket();

  mpSocket.onGameStart((data) => {
    console.log("Game started with ID:", data.gameId);
  });

  mpSocket.onOpponentGameState((data) => {
    console.log("Opponent game state received:", data);
    opponentTileset.placedBlocks = data.placedBlocks;
    opponentTileset.activeTet = data.activeTet;
    updateOpponentTilesetCallback();
  });

  mpSocket.onAddLayers((data) => {
    console.log("Received layers to add from opponent:", data.layers);
    // localTileset.addLayers(data.layers);
  });

  mpSocket.onOpponentGameOver((data) => {
    console.log("Opponent game over received:", data);
    alert("Opponent lost the game! You win!");
  });

  const updateLocalTilesetCallback = () => {
    localCtx.clearRect(0, 0, localCanvas.width, localCanvas.height);
    console.log("Local Tileset updated");
  };

  const updateLocalScoreCallback = (score) => {
    const scoreElement = document.getElementById("playerScore");
    if (scoreElement) {
      scoreElement.textContent = score.toString();
    }
    console.log("Local score updated:", score);
  };

  const sendLocalLayersCallback = (clearable) => {
    console.log("Sending layers to server:", clearable);
    mpSocket.sendLayers(clearable);
  };

  const gameoverLocalCallback = () => {
    console.log("Local game over. Notifying server...");
    mpSocket.gameover();
  };

  const updateOpponentTilesetCallback = () => {
    opponentCtx.clearRect(0, 0, opponentCanvas.width, opponentCanvas.height);
    console.log("Opponent Tileset updated");
  };

  const noop = () => {};

  const localTileset = new Tileset(
    Settings.mapHeight,
    Settings.mapWidth,
    updateLocalTilesetCallback,
    updateLocalScoreCallback,
    sendLocalLayersCallback,
    gameoverLocalCallback
  );

  const opponentTileset = new Tileset(
    Settings.mapHeight,
    Settings.mapWidth,
    noop,
    noop,
    noop,
    noop
  );

  const camera = new Camera();
  const localRenderer = new Renderer(localCanvas, localCtx);
  const opponentRenderer = new Renderer(opponentCanvas, opponentCtx);
  const inputHandler = new InputHandler(camera, localTileset);

  const gameTimer = new GameTimer(Settings.fallDelay, () => {
    if (!localTileset.playTetMode()) {
      localTileset.addTet(TetrominoGenerator.getRandomTetromino());
      localTileset.initTetMode();
    }
  });

  inputHandler.bindDefaultCameraControls();
  inputHandler.bindDefaultMovementControls();

  localTileset.initTetMode();
  localTileset.addTet(TetrominoGenerator.getRandomTetromino());
  localTileset.initTetMode();

  setInterval(() => {
    mpSocket.updateGameState(localTileset.placedBlocks, localTileset.activeTet);
  }, 200);

  let lastTime = performance.now();

  function render() {
    if (!localCtx || !opponentCtx) return;

    const now = performance.now();
    const deltaTime = now - lastTime;
    lastTime = now;
    camera.update(deltaTime);

    localCtx.clearRect(0, 0, localCanvas.width, localCanvas.height);
    opponentCtx.clearRect(0, 0, opponentCanvas.width, opponentCanvas.height);

    localRenderer.renderTiles(localTileset.adj, camera.angle);

    localRenderer.renderWalls2(
      localTileset.placedBlocks,
      localTileset.activeTet,
      localTileset.activeTetGhost,
      camera.angle
    );

    opponentRenderer.renderTiles(opponentTileset.adj, camera.angle);

    opponentRenderer.renderWalls2(
      opponentTileset.placedBlocks,
      opponentTileset.activeTet,
      opponentTileset.activeTetGhost,
      camera.angle
    );

    gameTimer.update();
    requestAnimationFrame(render);
  }
  render();
};
