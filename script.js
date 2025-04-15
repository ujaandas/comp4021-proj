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

function drawGrid(ctx, posX, posY, mult, size) {
  for (let i = -size / 2; i < size / 2; i++) {
    for (let j = -size / 2; j < size / 2; j++) {
      const rowShift = mult * i;
      const colShift = (mult * i) / 2;
      drawTile(
        ctx,
        posX + mult * j + rowShift,
        posY - (mult * j) / 2 + colShift,
        mult
      );
    }
  }
}

function renderTestCubeL(ctx, w, h, mult, col) {
  ctx.beginPath();
  ctx.moveTo(w / 2, h / 2 + mult);
  ctx.lineTo(w / 2 - mult, h / 2 + mult / 2);
  ctx.lineTo(w / 2 - mult, h / 2 - mult / 2);
  ctx.lineTo(w / 2, h / 2);
  ctx.closePath();
  ctx.fillStyle = col;
  ctx.fill();
}

function renderTestCubeR(ctx, w, h, mult, col) {
  ctx.beginPath();
  ctx.moveTo(w / 2, h / 2 + mult);
  ctx.lineTo(w / 2 + mult, h / 2 + mult / 2);
  ctx.lineTo(w / 2 + mult, h / 2 - mult / 2);
  ctx.lineTo(w / 2, h / 2);
  ctx.closePath();
  ctx.fillStyle = col;
  ctx.fill();
}

function renderTestCubeT(ctx, w, h, mult, col) {
  ctx.beginPath();
  ctx.moveTo(w / 2, h / 2);
  ctx.lineTo(w / 2 - mult, h / 2 - mult / 2);
  ctx.lineTo(w / 2, h / 2 - mult);
  ctx.lineTo(w / 2 + mult, h / 2 - mult / 2);
  ctx.closePath();
  ctx.fillStyle = col;
  ctx.fill();
}

window.onload = function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const mult = 100;
  const size = mult / 2;

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid(
      ctx,
      canvas.width / 2 + mult,
      canvas.height / 2 - mult / 2,
      mult,
      size
    );

    ctx.fillStyle = "#f00";
    const dotSize = 10;
    ctx.fillRect(
      canvas.width / 2 - dotSize / 2,
      canvas.height / 2 - dotSize / 2,
      dotSize,
      dotSize
    );

    switch (camera.dir) {
      case 1:
        renderTestCubeL(ctx, canvas.width, canvas.height, mult, "red");
        renderTestCubeR(ctx, canvas.width, canvas.height, mult, "green");
        renderTestCubeT(ctx, canvas.width, canvas.height, mult, "blue");
        break;
      case 2:
        renderTestCubeL(ctx, canvas.width, canvas.height, mult, "yellow");
        renderTestCubeR(ctx, canvas.width, canvas.height, mult, "red");
        renderTestCubeT(ctx, canvas.width, canvas.height, mult, "blue");
        break;
      case 3:
        renderTestCubeL(ctx, canvas.width, canvas.height, mult, "orange");
        renderTestCubeR(ctx, canvas.width, canvas.height, mult, "yellow");
        renderTestCubeT(ctx, canvas.width, canvas.height, mult, "blue");
        break;
      case 4:
        renderTestCubeL(ctx, canvas.width, canvas.height, mult, "green");
        renderTestCubeR(ctx, canvas.width, canvas.height, mult, "orange");
        renderTestCubeT(ctx, canvas.width, canvas.height, mult, "blue");
        break;
    }

    requestAnimationFrame(render);
  }
  render();
};
