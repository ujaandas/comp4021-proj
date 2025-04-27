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
const turnSpeed = 4;
let activeBlockIndex = 0;
let activeBlock = blocks[activeBlockIndex];
const fallSpeed = 1000;

window.addEventListener("keydown", (e) => {
    // if (e.repeat) return;

    if (e.key === "ArrowLeft") {
        camera.angle += turnSpeed;
    }
    if (e.key === "ArrowRight") {
        camera.angle -= turnSpeed;
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
        const originY = 80;

        const angleInRadians = (camera.angle * Math.PI) / 180;

        function gridToScreen(i, j, k = 0) {
            let screenX = ((i - j) * tileWidth) / 2;
            let screenY = ((i + j) * tileHeight) / 2 - (k + kShift) * tileHeight;
            return {
                x: originX + screenX,
                y: originY + screenY,
            };
        }

        function gridToScreen2(i, j, k = 0) {
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

        function paintWallBetween(i1, j1, k1, i2, j2, k2) {
            const { x: x1, y: y1 } = gridToScreen(i1, j1, k1);
            const { x: x2, y: y2 } = gridToScreen(i2, j2, k2);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1, y1 - tileHeight);
            ctx.lineTo(x2, y2 - tileHeight);
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

            cells.map((cell) => {
                paintWallBetween(cell.i - 1, cell.j, cell.k, cell.i, cell.j, cell.k);
                paintWallBetween(cell.i, cell.j - 1, cell.k, cell.i, cell.j, cell.k);
            });
        }

        // draw tilemap (todo: refactor to better integrate with Tileset cls)
        tileset.adj.forEach((edges, key) => {
            edges.forEach(edge => {
                const { x: startX, y: startY } = gridToScreen(edge.start.i, edge.start.j);
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
            ctx.font = "12px sans-serif";
            ctx.fillText(`${i},${j}`, x + 4, y - 4);
        });

        // blocks
            /*
            .sort((a, b) => {
                const depthA = a.base.i + a.base.j - a.base.k;
                const depthB = b.base.i + b.base.j - b.base.k;
                return depthA - depthB;
            })
            */
        // .forEach((block) => { drawBlock(block); });

        paintWallBetween(0, 0, 0, 1, 0, 0);

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
