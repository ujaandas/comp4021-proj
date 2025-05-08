import { InputHandler } from "./utils/InputHandler.js";
import { Renderer } from "./render/Renderer.js";
import { Tileset } from "./tileset/Tileset.js";
import { Camera } from "./utils/Camera.js";
import { Settings } from "./utils/Settings.js";
import { GameTimer } from "./utils/GameTimer.js";
import { MultiplayerSocket } from "./socket/Socket.js";
import { TetrominoGenerator } from "./utils/TetGenerator.js";

window.onload = function () {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // const mpSocket = new MultiplayerSocket("http://localhost:3000");

  const tileset = new Tileset(Settings.mapHeight, Settings.mapWidth, () => {});

  const camera = new Camera();
  const renderer = new Renderer(canvas, ctx);
  const inputHandler = new InputHandler(camera, tileset);

  const gameTimer = new GameTimer(Settings.fallDelay, () => {
    tileset.playTetMode();
  });

  inputHandler.bindDefaultCameraControls();
  inputHandler.bindDefaultMovementControls();

  tileset.initTetMode();

  function spawnTetromino() {
    const tetromino = TetrominoGenerator.getRandomTetromino();
    tileset.addTet(tetromino);
  }

  spawnTetromino();

  let lastTime = performance.now();

  function render() {
    if (!ctx) return;

    const now = performance.now();
    const deltaTime = now - lastTime;
    lastTime = now;

    camera.update(deltaTime);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    renderer.renderTiles(tileset.adj, camera.angle);

    renderer.renderWalls2(
      tileset.placedBlocks,
      tileset.activeTet,
      tileset.activeTetGhost,
      camera.angle
    );

    if (!tileset.activeTet) {
      spawnTetromino();
    }

    gameTimer.update();

    requestAnimationFrame(render);
  }

  render();
};
