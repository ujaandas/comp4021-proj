import { Block } from "./components/Block.js";
import { Tetromino } from "./components/Tetromino.js";
import { InputHandler } from "./utils/InputHandler.js";
import { Renderer } from "./render/Renderer.js";
import { Tileset } from "./tileset/Tileset.js";
import { Camera } from "./utils/Camera.js";
import { Settings } from "./utils/Settings.js";
import { GameTimer } from "./utils/GameTimer.js";
import { Colour } from "./utils/Colour.js";

window.onload = function () {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const tileset = new Tileset(Settings.mapHeight, Settings.mapWidth);
  const camera = new Camera();
  const renderer = new Renderer(canvas, ctx);
  const inputHandler = new InputHandler(camera, tileset);

  const gameTimer = new GameTimer(Settings.fallDelay, () => {
    tileset.playTetMode();
  });

  inputHandler.bindDefaultCameraControls();
  inputHandler.bindDefaultMovementControls();

  // const block1 = Block.makeBlockOnPoint(5, 5, 2);
  // const block2 = Block.makeBlockOnPoint(5, 4);
  // const block3 = Block.makeBlockOnPoint(5, 4, 1);
  // const block4 = Block.makeBlockOnPoint(5, 4, 2);

  // const block5 = Block.makeBlockOnPoint(5, 5);
  // const block6 = Block.makeBlockOnPoint(8, 5);

  // const tet1 = new Tetromino(
  //   [block1, block2, block3, block4],
  //   Colour.getColour("red")
  // );
  // const tet2 = tet1.clone();
  // const tet3 = new Tetromino([block5], Colour.getColour("blue"));

  // tileset.addTet(tet1);
  // tileset.addTet(tet2);
  // tileset.addTet(tet3);

  const block1 = Block.makeBlockOnPoint(1, 1);
  const block2 = Block.makeBlockOnPoint(2, 1);
  const block3 = Block.makeBlockOnPoint(1, 2);
  const block4 = Block.makeBlockOnPoint(2, 2);

  const tet1 = new Tetromino(
    [block1, block2, Block.makeBlockOnPoint(2, 1, 1)],
    Colour.getColour("red")
  );
  const tet2 = tet1.clone(Colour.getColour("blue"));
  const tet3 = tet2.clone();
  const tet4 = tet3.clone();

  tileset.addTet(tet1);
  tileset.addTet(tet2);
  // tileset.addTet(tet3);
  // tileset.addTet(tet4);
  // tileset.addTet(tet1.clone());

  tileset.initTetMode();

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

    // if (tileset.activeTet && tileset.activeTetGhost) {
    //   renderer.renderTetAndGhostWalls(
    //     tileset.activeTet,
    //     camera.angle,
    //     tileset.activeTetGhost
    //   );
    // }

    // tileset.placedBlocks.forEach((block) => {
    //   renderer.renderBlockWalls(block, camera.angle);
    // });

    gameTimer.update();
    requestAnimationFrame(render);
  }

  render();
};
