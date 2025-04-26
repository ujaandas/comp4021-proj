let camera = {
    angle: 0,
};

const initalK = 4;
const blocks = [
    {
        colors: ["rgba(255,0,0,1)", "rgba(220, 20, 60, 1)", "rgba(139, 0, 0, 1)"],
        cells: [
            { i: 2, j: 2, k: initalK },
            //{ i: 2, j: 3, k: initalK },
            //{ i: 2, j: 3, k: initalK + 1 },
            { i: 3, j: 2, k: initalK },
        ],
    },
];

const tileset = new Tileset(9, 9, 100);
console.log(tileset);


const kShift = -3;
let activeBlockIndex = 0;
let activeBlock = blocks[activeBlockIndex];
const fallSpeed = 1000;

window.addEventListener("keydown", (e) => {
    if (e.repeat) return;

    if (e.key === "ArrowLeft") {
        camera.angle -= 10;
    }
    if (e.key === "ArrowRight") {
        camera.angle += 10;
    }

    if (activeBlock) {
        const key = e.key.toLowerCase();
        if (key === "a")
            activeBlock.cells.forEach((cell) => {
                cell.i--;
                cell.j++;
            });
        if (key === "d")
            activeBlock.cells.forEach((cell) => {
                cell.i++;
                cell.j--;
            });
        if (key === "w")
            activeBlock.cells.forEach((cell) => {
                cell.i--;
                cell.j--;
            });
        if (key === "s")
            activeBlock.cells.forEach((cell) => {
                cell.i++;
                cell.j++;
            });
    }

    camera.angle = (camera.angle + 360) % 360;
});

window.onload = function () {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const gridSize = 9;
        const tileWidth = 100;
        const tileHeight = tileWidth / 2;
        const originX = canvas.width / 2;
        const originY = 60;

        const angleInRadians = (camera.angle * Math.PI) / 180;

        function gridToScreen(i, j, k = 0) {
            const rotatedI =
                i * Math.cos(angleInRadians) - j * Math.sin(angleInRadians);
            const rotatedJ =
                i * Math.sin(angleInRadians) + j * Math.cos(angleInRadians);

            let screenX = ((rotatedI - rotatedJ) * tileWidth) / 2;
            let screenY =
                ((rotatedI + rotatedJ) * tileHeight) / 2 - (k + kShift) * tileHeight;
            return {
                x: originX + screenX,
                y: originY + screenY,
            };
        }

        function drawTileFlat(x, y, i, j) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            i != undefined ? ctx.fillText(`${i}, ${j}`, x - 10, y + tileHeight / 2) : "";
            ctx.lineTo(x + tileWidth / 2, y + tileHeight / 2);
            ctx.lineTo(x, y + tileHeight);
            ctx.lineTo(x - tileWidth / 2, y + tileHeight / 2);
            ctx.closePath();
        }

        function paintCellFlat(i, j, k, col) {
            const { x, y } = gridToScreen(i, j, k);
            drawTileFlat(x, y);
            ctx.fillStyle = col;
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

        function paintCellWall(i, j, k, col, flipped = false) {
            const { x, y } = gridToScreen(i, j, k);
            drawTileWall(x, y, flipped);
            ctx.fillStyle = col;
            ctx.fill();
        }

        function paintWallBetween(i1, j1, k1, i2, j2, k2) {
            const { x: x1, y: y1 } = gridToScreen(i1, j1, k1);
            const { x: x2, y: y2 } = gridToScreen(i2, j2, k2);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1, y1 + tileHeight);
            ctx.lineTo(x2, y2 + tileHeight);
            ctx.lineTo(x2, y2);
            ctx.closePath();
            ctx.fillStyle = "green";
            ctx.fill();
        }

        function drawBlock(block) {
            const cells = block.cells;

            cells.sort((a, b) => {
                const dA = a.i + a.j - a.k;
                const dB = b.i + b.j - b.k;
                return dA - dB;
            });

            for (let i = 0; i < cells.length; i++) {
                const a = cells[i]
                const b = cells[i + 1]


                if (b && a.i + 1 == b.i && a.j == b.j) {
                    //console.log(`a (${a.i}, ${a.j}, ${a.k}) and b (${b.i}, ${b.j}, ${b.k}) in same pos`);
                    paintCellWall(a.i, a.j, a.k, "darkblue");
                    paintCellWall(a.i, a.j, a.k, "blue", true);
                    // if (b.k > a.k) continue;
                } else {
                    paintCellWall(a.i, a.j, a.k, block.colors[2]);
                    paintCellWall(a.i, a.j, a.k, block.colors[1], true);
                }
            }
        }

        // draw tilemap (todo: refactor to better integrate with Tileset cls)
        for (let i = 0; i < tileset.w; i++) {
            for (let j = 0; j < tileset.h; j++) {
                const pos = gridToScreen(i, j, 0);
                drawTileFlat(pos.x, pos.y, i, j);
                ctx.stroke();
            }
        }

        // blocks
            /*
            .sort((a, b) => {
                const depthA = a.base.i + a.base.j - a.base.k;
                const depthB = b.base.i + b.base.j - b.base.k;
                return depthA - depthB;
            })
            */
        //    .forEach((block) => { drawBlock(block); drawBlockGhost(block) });

        paintWallBetween(2, 2, 0, 3, 2, 0); 
        paintWallBetween(3, 2, 0, 3, 1, 0);
        requestAnimationFrame(render);
    }
    render();

    setInterval(() => {
        if (activeBlock) {
            activeBlock.cells.forEach((cell) => cell.k--);
            const minK = Math.min(...activeBlock.cells.map((cell) => cell.k));
            if (minK <= initalK + kShift * 2) {
                console.log(`Min K reached! ${minK}`);
                activeBlock.cells.map((cell) => console.log(`Cell coords: ${cell.i - cell.k}, ${cell.j - cell.k}`));
                activeBlockIndex++;
                activeBlock = blocks[activeBlockIndex] || null;
            }
        }
    }, fallSpeed);
};
