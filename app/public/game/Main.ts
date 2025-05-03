import { Block } from "./components/Block.js";
import { Coordinate } from "./components/Coordinate.js";
import { InputHandler } from "./utils/InputHandler.js";
import { Renderer } from "./render/Renderer.js";
import { Tileset } from "./tileset/Tileset.js";
import { Wall } from "./components/Wall.js";

window.onload = function () {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const tileset = new Tileset(9, 9);
  const renderer = new Renderer(canvas, ctx);
  const inputHandler = new InputHandler();

  inputHandler.bindKey("arrowleft", () => {
    cameraAngle = (cameraAngle + 4) % 360;
  });

  inputHandler.bindKey("arrowright", () => {
    cameraAngle = (cameraAngle - 4) % 360;
  });

  inputHandler.bindKey("w", () => {
    tileset.activeBlock?.translate(-1, -1);
    tileset.activeBlockGhost?.translate(-1, -1);
  });

  inputHandler.bindKey("a", () => {
    tileset.activeBlock?.translate(-1, 1);
    tileset.activeBlockGhost?.translate(-1, 1);
  });

  inputHandler.bindKey("s", () => {
    tileset.activeBlock?.translate(1, 1);
    tileset.activeBlockGhost?.translate(1, 1);
  });

  inputHandler.bindKey("d", () => {
    tileset.activeBlock?.translate(1, -1);
    tileset.activeBlockGhost?.translate(1, -1);
  });

  const block1 = new Block([
    new Wall(
      new Coordinate(2, 2),
      new Coordinate(3, 2),
      3,
      "rgba(255, 0, 0, 1)"
    ),
    new Wall(
      new Coordinate(3, 2),
      new Coordinate(3, 1),
      3,
      "rgba(255, 0, 0, 1)"
    ),
  ]);
  tileset.addBlock(block1);

  let cameraAngle = 0;
  let lastFallTime = Date.now();

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    renderer.renderTiles(tileset.adj, cameraAngle);

    const now = Date.now();
    if (tileset.activeBlock) {
      renderer.renderBlock(
        tileset.activeBlock,
        cameraAngle,
        tileset.activeBlockGhost ?? undefined
      );

      if (now - lastFallTime >= 1000) {
        if (tileset.activeBlock.fallCount < 3) {
          tileset.activeBlock.walls.forEach((wall) => wall.h--);
          tileset.activeBlock.fallCount++;
        } else {
          tileset.advanceBlock();
          tileset.activeBlock?.walls.forEach((wall) => wall.h--);
        }
        lastFallTime = now;
      }
    }

    requestAnimationFrame(render);
  }
  render();
};
