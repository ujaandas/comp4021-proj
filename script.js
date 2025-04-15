let camera = {
  dir: 1,
};

window.addEventListener("keydown", (e) => {
  if (e.repeat) return;

  if (e.key === "a") {
    camera.dir = camera.dir <= 1 ? 4 : camera.dir - 1;
    // console.log(camera.dir);
  }
  if (e.key === "d") {
    camera.dir = camera.dir >= 4 ? 1 : camera.dir + 1;
    // console.log(camera.dir);
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

function screen2Grid(x, y, z, size) {
  // convert screen coordinates (x, y, z) into grid coordinates where:
  // (canvas.width/2, 0, canvas.height/2) becomes (0, y, 0)
  const gridX = Math.round((x - canvas.width / 2) / size);
  const gridZ = Math.round((z - canvas.height / 2) / size);
  const gridY = y; // remains unchanged
  return { gridX, gridY, gridZ };
}

function rotateCube(cube, pivotX, pivotZ, dir, size) {
  // if (cube.x === pivotX) {
  //   return { ...cube };
  // }
  const { gridX, gridY, gridZ } = screen2Grid(cube.x, cube.y, cube.z, size);
  console.log(`Translated xyz: ${gridX}, ${gridY}, ${gridZ}`);
  return { ...cube };
}

window.onload = function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const size = 100;
  const scale = size / 2;

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

    const pivotX = canvas.width / 2;
    const pivotZ = canvas.height / 2;

    const angle = (camera.dir - 1) * (Math.PI / 2);

    // console.log(angle);

    // include camera.dir in this calculation?
    // todo: come up with new way to place cubes
    // currently, must manually adjust z - sort of "cheating" to place block on top of another
    // ideally, should set same x and z, and then append y
    const cubes = [
      { x: canvas.width / 2, y: 1, z: canvas.height / 2 }, // block above origin
      { x: canvas.width / 2, y: 0, z: canvas.height / 2 }, // origin block
      { x: canvas.width / 2, y: 2, z: canvas.height / 2 }, // origin block
      { x: canvas.width / 2 - size, y: 0, z: canvas.height / 2 - size / 2 }, // should be at grid(-1,-1)
      { x: canvas.width / 2 + size, y: 0, z: canvas.height / 2 + size / 2 }, // should be at grid(-1,-1)
    ]; // hardcoded, akin to a level or stage snapshot (ie; middle of the game)
    // something like a "default" value, assumes default state as camera.dir == 1
    console.log(`Unsorted cubes: ${cubes.map((cube) => JSON.stringify(cube))}`);

    // for all cubes with same x and z, sort by y and in that order, append i * -size
    cubes.sort((a, b) => {
      // first sort by grid position: x then z.
      if (a.x !== b.x) return a.x - b.x;
      if (a.z !== b.z) return a.z - b.z;
      // for cubes in the same grid cell, sort by y ascending.
      return a.y - b.y;
    });

    console.log(`Sorted cubes: ${cubes.map((cube) => JSON.stringify(cube))}`);

    // compute appropriate z values for stacked cubes
    let lastGridKey = "";
    let stackIndex = 0;

    cubes.forEach((cube, i) => {
      // create key for curr cell based on x, z
      const currentKey = `${cube.x}_${cube.z}`;

      // if new grid reset stack
      if (currentKey !== lastGridKey) {
        stackIndex = 0;
        lastGridKey = currentKey;
      } else {
        // increment counter same stack cubes
        stackIndex++;
      }

      // adjust cube z based on stack order
      // first cube in the cell keeps its original z
      // next  is pushed back by size, etc.
      cube.z += stackIndex * -size;
    });

    // spin everything about the origin, ie; move everything where x and z are both == canvas.width/height / 2, respectively
    // const rotatedCubes = cubes.map((cube) => {
    //   return rotateCube(cube, pivotX, pivotZ, camera.dir, size);
    // });

    // rotatedCubes.sort((a, b) => (a.y === b.y ? a.z - b.z : a.y - b.y));
    cubes.forEach((cube) => {
      renderTestCube(ctx, cube.x, cube.z, size);
    });

    requestAnimationFrame(render);
  }
  render();
};
