import { InputHandler } from "../game/utils/InputHandler.js";
import { Renderer } from "../game/render/Renderer.js";
import { Tileset } from "../game/tileset/Tileset.js";
import { Camera } from "../game/utils/Camera.js";
import { Settings } from "../game/utils/Settings.js";
import { GameTimer } from "../game/utils/GameTimer.js";
import { TetrominoGenerator } from "../game/utils/TetGenerator.js";
import { MultiplayerSocket } from "../game/socket/Socket.js";

window.onload = function () {
  const localCanvas = document.getElementById(
    "localCanvas"
  ) as HTMLCanvasElement;

  const localCtx = localCanvas.getContext("2d");

  if (!localCtx) return;

  const opponentCanvas = document.getElementById(
    "opponentCanvas"
  ) as HTMLCanvasElement;

  const opponentCtx = opponentCanvas.getContext("2d");

  if (!opponentCtx) return;

  localCanvas.width = window.innerWidth / 2;
  localCanvas.height = window.innerHeight;

  opponentCanvas.width = window.innerWidth / 2;
  opponentCanvas.height = window.innerHeight;

  const mpSocket = new MultiplayerSocket("http://localhost:3000");

  const updateLocalTilesetCallback = () => {
    localCtx.clearRect(0, 0, localCanvas.width, localCanvas.height);
    console.log("Local Tileset updated");
  };

  const updateLocalScoreCallback = (score: number) => {
    const scoreElement = document.getElementById("score");
    if (scoreElement) {
      scoreElement.textContent = score.toString();
    }
    console.log("Local score updated:", score);
  };

  const sendLocalLayersCallback = (clearable: number) => {
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

  const updateOpponentScoreCallback = (score: number) => {
    const scoreElement = document.getElementById("opponentScore");
    if (scoreElement) {
      scoreElement.textContent = score.toString();
    }
    console.log("Opponent score updated:", score);
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
    updateOpponentTilesetCallback,
    updateOpponentScoreCallback,
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

  mpSocket.on(
    "opponentGameState",
    (data: { placedBlocks: any[]; activeTet: any; score: number }) => {
      updateOpponentTilesetCallback();
      updateOpponentScoreCallback(data.score);
    }
  );

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
