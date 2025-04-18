let camera = {
  // dir: 1,
};

const blocks = [
  {
    color: "rgba(255,0,0,0.8)",
    cells: [
      { i: 2, j: 2, k: 0 },
      { i: 2, j: 3, k: 0 },
      { i: 2, j: 3, k: 1 },
      { i: 3, j: 2, k: 0 },
      // { i: 2, j: 3, k: 2 },
    ],
  },
  // {
  //   color: "rgba(0,0,255,0.8)",
  //   cells: [
  //     { i: 5, j: 5, k: 0 },
  //     { i: 6, j: 5, k: 0 },
  //     { i: 7, j: 5, k: 0 },
  //     { i: 7, j: 6, k: 0 },
  //   ],
  // },
];

window.addEventListener("keydown", (e) => {
  if (e.repeat) return;

  // if (e.key === "a") {
  //   camera.dir = camera.dir <= 1 ? 4 : camera.dir - 1;
  // }
  // if (e.key === "d") {
  //   camera.dir = camera.dir >= 4 ? 1 : camera.dir + 1;
  // }
});

window.onload = function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gridSize = 20;
    const tileWidth = 100;
    const tileHeight = tileWidth / 2;
    const originX = canvas.width / 2;
    const originY = 60;

    function gridToScreen(i, j, k = 0) {
      let screenX = ((i - j) * tileWidth) / 2;
      let screenY = ((i + j) * tileHeight) / 2 - k * tileHeight;
      return {
        x: originX + screenX,
        y: originY + screenY,
      };
    }

    function drawTileFlat(x, y) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + tileWidth / 2, y + tileHeight / 2);
      ctx.lineTo(x, y + tileHeight);
      ctx.lineTo(x - tileWidth / 2, y + tileHeight / 2);
      ctx.closePath();
    }

    function paintCellFlat(i, j, k) {
      const { x, y } = gridToScreen(i, j, k);
      drawTileFlat(x, y);
      ctx.fillStyle = "red";
      ctx.fill();
    }

    function drawTileWall(x, y, flipped = false) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + tileHeight);
      const offset = flipped ? tileWidth / 2 : -tileWidth / 2;
      ctx.lineTo(x + offset, y + tileHeight / 2);
      ctx.lineTo(x + offset, y - tileHeight / 2);
      ctx.closePath();
    }

    function paintCellWall(i, j, k, flipped = false) {
      const { x, y } = gridToScreen(i, j, k);
      drawTileWall(x, y, flipped);
      ctx.fillStyle = flipped ? "crimson" : "darkred";
      ctx.fill();
    }

    function drawBlock(block) {
      const cells = block.cells;

      const cellsByPos = {};
      cells.forEach((cell) => {
        const key = `${cell.i},${cell.j}`;
        if (!cellsByPos[key]) {
          cellsByPos[key] = [];
        }
        cellsByPos[key].push(cell);
      });

      Object.values(cellsByPos).forEach((cellGroup) => {
        cellGroup.sort((a, b) => a.k - b.k);
      });

      // Render cells:
      Object.values(cellsByPos).forEach((cellGroup) => {
        cellGroup.forEach((cell, index) => {
          const { i, j, k } = cell;
          const aboveCell = cellGroup[index + 1];

          paintCellWall(i, j, k);
          paintCellWall(i, j, k, true);

          if (!aboveCell || aboveCell.k > k + 1) {
            paintCellFlat(i, j, k + 1);
          }
        });
      });
    }

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const pos = gridToScreen(i, j, 0);
        drawTileFlat(pos.x, pos.y);
        ctx.stroke();
      }
    }

    blocks
      .sort((a, b) => {
        const depthA = a.base.i + a.base.j - a.base.k;
        const depthB = b.base.i + b.base.j - b.base.k;
        return depthA - depthB;
      })
      .forEach((block) => drawBlock(block));

    requestAnimationFrame(render);
  }
  render();
};
