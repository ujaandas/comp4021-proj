let camera = {
  dir: 1,
};

window.addEventListener("keydown", (e) => {
  if (e.repeat) return;

  if (e.key === "a") {
    camera.dir = camera.dir <= 1 ? 4 : camera.dir - 1;
    console.log(camera.dir);
  }
  if (e.key === "d") {
    camera.dir = camera.dir >= 4 ? 1 : camera.dir + 1;
    console.log(camera.dir);
  }
});

function drawTile(ctx, posX, posY, size) {
  // posX and posY here determine the middle (ie; center) of the tile, not the starting point
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(posX, posY);
  ctx.lineTo(posX - size, posY + size / 2);
  ctx.lineTo(posX, posY + size);
  ctx.lineTo(posX + size, posY + size / 2);
  ctx.moveTo(posX, posY);
  ctx.closePath();
  ctx.stroke();
}

function drawGrid(ctx, posX, posY, size, scale) {
  for (let i = -scale / 2; i < scale / 2; i++) {
    for (let j = -scale / 2; j < scale / 2; j++) {
      const rowShift = size * i;
      const colShift = (size * i) / 2;
      drawTile(
        ctx,
        posX + size * j + rowShift,
        posY - (size * j) / 2 + colShift,
        size
      );
    }
  }
}

function renderTestCubeL(ctx, w, h, size, col) {
  ctx.beginPath();
  ctx.moveTo(w, h + size);
  ctx.lineTo(w - size, h + size / 2);
  ctx.lineTo(w - size, h - size / 2);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fillStyle = col;
  ctx.fill();
}

function renderTestCubeR(ctx, w, h, size, col) {
  ctx.beginPath();
  ctx.moveTo(w, h + size);
  ctx.lineTo(w + size, h + size / 2);
  ctx.lineTo(w + size, h - size / 2);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fillStyle = col;
  ctx.fill();
}

function renderTestCubeT(ctx, w, h, size, col) {
  ctx.beginPath();
  ctx.moveTo(w, h);
  ctx.lineTo(w - size, h - size / 2);
  ctx.lineTo(w, h - size);
  ctx.lineTo(w + size, h - size / 2);
  ctx.closePath();
  ctx.fillStyle = col;
  ctx.fill();
}

function renderTestCube(ctx, w, h, size) {
  renderTestCubeL(ctx, w, h, size, "darkred");
  renderTestCubeR(ctx, w, h, size, "crimson");
  renderTestCubeT(ctx, w, h, size, "red");
}

window.onload = function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const size = 100;
  const scale = size / 2;

  const cubes = [
    { x: canvas.width / 2, y: canvas.height / 2 },
    { x: canvas.width / 2 + size, y: canvas.height / 2 - size / 2 },
    { x: canvas.width / 2 - size, y: canvas.height / 2 - size / 2 },
    { x: canvas.width / 2, y: canvas.height / 2 - size },
  ];

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid(
      ctx,
      canvas.width / 2 + size,
      canvas.height / 2 - size / 2,
      size,
      scale
    );

    ctx.fillStyle = "#f00";
    const dotSize = 10;
    ctx.fillRect(
      canvas.width / 2 - dotSize / 2,
      canvas.height / 2 - dotSize / 2,
      dotSize,
      dotSize
    );

    // painter's algo, sort by depth based on camera.dir
    cubes.sort((a, b) => a.y - b.y); // -ve means b, a

    for (let i = 0; i < cubes.length; i++) {
      renderTestCube(ctx, cubes[i].x, cubes[i].y, size);
    }

    // switch (camera.dir) {
    //   case 1:
    //     renderTestCube(
    //       ctx,
    //       canvas.width / 2 + size,
    //       canvas.height / 2 - size / 2,
    //       size
    //     );
    //     renderTestCube(ctx, canvas.width / 2, canvas.height / 2, size);
    //     break;
    //   case 2:
    //     renderTestCube(
    //       ctx,
    //       canvas.width / 2 - size,
    //       canvas.height / 2 - size / 2,
    //       size
    //     );
    //     renderTestCube(ctx, canvas.width / 2, canvas.height / 2, size);
    //     break;
    //   case 3:
    //     renderTestCube(ctx, canvas.width / 2, canvas.height / 2, size);
    //     renderTestCube(
    //       ctx,
    //       canvas.width / 2 - size,
    //       canvas.height / 2 + size / 2,
    //       size
    //     );
    //     break;
    //   case 4:
    //     renderTestCube(ctx, canvas.width / 2, canvas.height / 2, size);
    //     renderTestCube(
    //       ctx,
    //       canvas.width / 2 + size,
    //       canvas.height / 2 + size / 2,
    //       size
    //     );
    //     break;
    // }

    requestAnimationFrame(render);
  }
  render();
};
