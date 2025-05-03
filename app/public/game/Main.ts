import { Block } from "./components/Block.js";
import { InputHandler } from "./utils/InputHandler.js";
import { Renderer } from "./render/Renderer.js";
import { Tileset } from "./tileset/Tileset.js";
import { Camera } from "./utils/Camera.js";
import { Settings } from "./utils/Settings.js";

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

  inputHandler.bindDefaultCameraControls(camera);
  inputHandler.bindDefaultMovementControls(tileset);

  const block1 = Block.makeBlockOnPoint(5, 5);
  const block2 = Block.makeBlockOnPoint(7, 3);
  const block3 = Block.makeBlockOnPoint(8, 0);
  const block4 = Block.makeBlockOnPoint(5, 5);
  tileset.addBlock(block1);
  tileset.addBlock(block2);
  tileset.addBlock(block3);
  tileset.addBlock(block4);

  let lastFallTime = Date.now();

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    renderer.renderTiles(tileset.adj, camera.angle);

    const now = Date.now();
    if (tileset.activeBlock) {
      renderer.renderBlock(
        tileset.activeBlock,
        camera.angle,
        tileset.activeBlockGhost ?? undefined
      );

      if (now - lastFallTime >= Settings.fallDelay) {
        if (tileset.activeBlock.fallCount < Settings.fallHeight) {
          tileset.activeBlock.walls.forEach((wall) => wall.height--);
          tileset.activeBlock.fallCount++;
        } else {
          tileset.setNextActiveBlock();
          tileset.setNextGhostBlock();
        }
        lastFallTime = now;
      }
    }

    requestAnimationFrame(render);
  }
  render();
};
