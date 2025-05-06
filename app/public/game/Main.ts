import { Block } from "./components/Block.js";
import { InputHandler } from "./utils/InputHandler.js";
import { Renderer } from "./render/Renderer.js";
import { Tileset } from "./tileset/Tileset.js";
import { Camera } from "./utils/Camera.js";
import { Settings } from "./utils/Settings.js";
import { GameTimer } from "./utils/GameTimer.js";

window.onload = function () {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const tileset = new Tileset(Settings.mapHeight, Settings.mapWidth);
  const camera = new Camera();
  const renderer = new Renderer(canvas, ctx);
  const inputHandler = new InputHandler();

  const gameTimer = new GameTimer(Settings.fallDelay, () => {
    tileset.play();
  });

  inputHandler.bindDefaultCameraControls(camera);
  inputHandler.bindDefaultMovementControls(tileset);

  const block1 = Block.makeBlockOnPoint(5, 5);
  const block2 = Block.makeBlockOnPoint(7, 3);
  const block3 = Block.makeBlockOnPoint(7, 3);
  tileset.addBlock(block1);
  tileset.addBlock(block2);
  tileset.addBlock(block3);

  tileset.setNextGhostBlock();

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    renderer.renderTiles(tileset.adj, camera.angle);

    tileset.placedBlocks.forEach((block) => {
      renderer.renderBlock(block, camera.angle);
    });

    if (tileset.activeBlock) {
      renderer.renderBlockAndGhost(
        tileset.activeBlock,
        camera.angle,
        tileset.activeBlockGhost ?? undefined
      );
    }

    gameTimer.update();

    requestAnimationFrame(render);
  }
  render();
};
