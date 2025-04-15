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

function drawTile(ctx, posX, posY) {
  ctx.fillStyle = "#f00";
  ctx.beginPath();
  ctx.moveTo(posX, posY);
  ctx.lineTo(posX - 100, posY + 50);
  ctx.lineTo(posX, posY + 100);
  ctx.lineTo(posX + 100, posY + 50);
  ctx.moveTo(posX, posY);
  ctx.closePath();
  ctx.fill();
}

function drawGrid(ctx, posX, posY) {
  const mult = 100;
  const size = 5;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      drawTile(
        ctx,
        posX + mult * j + mult * i,
        posY - (mult * j) / 2 + (mult * i) / 2
      );
    }
  }
}

window.onload = function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width / 2 - canvas.width / 4, canvas.height / 2);
    // drawTile(ctx, canvas.width / 2, canvas.height / 2);
    // drawTile(ctx, canvas.width / 2 + 100, canvas.height / 2 - 50);
    // drawTile(ctx, canvas.width / 2 + 200, canvas.height / 2 - 100);

    requestAnimationFrame(render);
  }
  render();
};
