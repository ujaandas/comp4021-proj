function getGhostColor(color: string) {
  if (!color) color = "rgba(0,0,0,1)";
  const match = color.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
  );
  if (match) return `rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.5)`;
  return color;
}

const camera = { angle: 0 };
const turnSpeed = 4;
const n = 3; // TODO: bound this dynamically per block (ie; constrain within tileset graph)

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") {
    camera.angle = (camera.angle + turnSpeed + 360) % 360;
  }
  if (e.key === "ArrowRight") {
    camera.angle = (camera.angle - turnSpeed + 360) % 360;
  }
  if (activeBlock && ghostBlock) {
    const key = e.key.toLowerCase();
    if (key === "a") {
      activeBlock.translate(-1, 1);
      ghostBlock.translate(-1, 1);
    }
    if (key === "d") {
      activeBlock.translate(1, -1);
      ghostBlock.translate(1, -1);
    }
    if (key === "w") {
      activeBlock.translate(-1, -1);
      ghostBlock.translate(-1, -1);
    }
    if (key === "s") {
      activeBlock.translate(1, 1);
      ghostBlock.translate(1, 1);
    }
  }
});

// todo: block ctor to dynamically build walls
const block1 = new Block([
  new Wall(
    new Coordinate(2, 2),
    new Coordinate(3, 2),
    n,
    "rgba(255, 50, 50, 1)"
  ),
  new Wall(new Coordinate(3, 2), new Coordinate(3, 1), n, "rgba(255, 0, 0, 1)"),
]);
const block2 = new Block([
  new Wall(new Coordinate(1, 4), new Coordinate(2, 4), n),
  new Wall(new Coordinate(2, 4), new Coordinate(2, 3), n),
  // new Wall(new Coordinate(4, 7), new Coordinate(4, 6)),
  // new Wall(new Coordinate(4, 6), new Coordinate(5, 6)),
]);
const blocks = [block1, block2];
let activeBlockIndex = 0;
let activeBlock = blocks[activeBlockIndex];
let ghostBlock = activeBlock ? activeBlock.clone() : null;
for (let i = 0; i < n; i++) {
  ghostBlock?.walls.forEach((wall) => wall.h--);
}

window.onload = function () {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const tileWidth = 100;
  const tileHeight = tileWidth / 2;
  const originX = canvas.width / 2;
  const originY = 80;
  const fallSpeed = 1000;
  let lastFallTime = Date.now();
  const tileset = new Tileset(9, 9);

  function gridToScreen(i: number, j: number, h = 0) {
    const hOffset = h * tileHeight;
    const angleInRadians = (camera.angle * Math.PI) / 180;
    const rotatedI =
      i * Math.cos(angleInRadians) - j * Math.sin(angleInRadians);
    const rotatedJ =
      i * Math.sin(angleInRadians) + j * Math.cos(angleInRadians);
    const screenX = ((rotatedI - rotatedJ) * tileWidth) / 2;
    const screenY =
      ((rotatedI + rotatedJ) * tileHeight) / 2 - tileHeight - hOffset;
    return { x: originX + screenX, y: originY + screenY };
  }

  function paintWall(wall: Wall) {
    const { x: x1, y: y1 } = gridToScreen(
      wall.start.i,
      wall.start.j,
      wall.h
    );

    const { x: x2, y: y2 } = gridToScreen(wall.end.i, wall.end.j, wall.h);

    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1, y1 - 50);
    ctx.lineTo(x2, y2 - 50);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.fillStyle = wall.colour;
    ctx.fill();
  }

  function render() {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    tileset.adj.forEach((edges, key) => {
      edges.forEach((edge) => {
        const { x: startX, y: startY } = gridToScreen(
          edge.start.i,
          edge.start.j
        );
        const { x: endX, y: endY } = gridToScreen(edge.end.i, edge.end.j);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      });
      const [i, j] = key.split(",").map(Number);
      const { x, y } = gridToScreen(i, j);
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(`${i},${j}`, x + 4, y - 4);
    });

    blocks.forEach((block) => {
      block.walls.forEach((wall) => paintWall(wall));
    });

    if (ghostBlock) {
      ghostBlock.walls.forEach((wall) => {
        const ghostColor = getGhostColor(wall.colour);
        const newWall = wall.clone();
        newWall.colour = ghostColor;
        paintWall(newWall);
      });
    }

    const now = Date.now();
    if (activeBlock) {
      if (!activeBlock.fallCount) activeBlock.fallCount = 0;
      if (now - lastFallTime >= fallSpeed) {
        if (activeBlock.fallCount < n) {
          activeBlock.walls.forEach((wall) => wall.h--);
          activeBlock.fallCount++;
        } else {
          console.log(activeBlock.walls[0].start.i);
          activeBlockIndex++;
          activeBlock = blocks[activeBlockIndex] || null;
          ghostBlock = activeBlock ? activeBlock.clone() : null;
          for (let i = 0; i < n; i++) {
            ghostBlock?.walls.forEach((w) => w.h--);
          }
        }
        lastFallTime = now;
      }
    }

    requestAnimationFrame(render);
  }
  render();
};
