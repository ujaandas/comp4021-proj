let camera = {
  // dir: 1,
};

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

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const pos = gridToScreen(i, j, 0);

        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x + tileWidth / 2, pos.y + tileHeight / 2);
        ctx.lineTo(pos.x, pos.y + tileHeight);
        ctx.lineTo(pos.x - tileWidth / 2, pos.y + tileHeight / 2);
        ctx.closePath();
        ctx.stroke();
      }
    }

    requestAnimationFrame(render);
  }
  render();
};
