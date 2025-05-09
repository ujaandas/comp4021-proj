import { InputHandler } from "./game/utils/InputHandler";
import { Renderer } from "./game/render/Renderer";
import { Tileset } from "./game/tileset/Tileset";
import { Camera } from "./game/utils/Camera";
import { Settings } from "./game/utils/Settings";
import { GameTimer } from "./game/utils/GameTimer";
import { TetrominoGenerator } from "./game/utils/TetGenerator";
import { io } from "socket.io-client";
import { Block } from "./game/components/Block";

export function renderGamePage(myUsername: string) {
  const appDiv = document.getElementById("app") as HTMLDivElement;
  if (!appDiv) {
    console.error("No element with id 'app' found.");
    return;
  }

  appDiv.innerHTML = `
    <div class="score-overlay">
      <span id="playerScore">0</span> - <span id="opponentScore">0</span>
    </div>
    <div class="canvas-container">
      <canvas id="localCanvas"></canvas>
      <canvas id="opponentCanvas"></canvas>
    </div>
  `;

  const localCanvas = document.getElementById(
    "localCanvas"
  ) as HTMLCanvasElement;
  const opponentCanvas = document.getElementById(
    "opponentCanvas"
  ) as HTMLCanvasElement;
  if (!localCanvas || !opponentCanvas) {
    console.error("Missing canvas elements.");
    return;
  }

  localCanvas.width = window.innerWidth / 2;
  localCanvas.height = window.innerHeight;
  opponentCanvas.width = window.innerWidth / 2;
  opponentCanvas.height = window.innerHeight;

  const localCtx = localCanvas.getContext("2d");
  const opponentCtx = opponentCanvas.getContext("2d");
  if (!localCtx || !opponentCtx) {
    console.error("Cannot get canvas contexts.");
    return;
  }

  const socket = io();

  const updateTilesetCallback = (block: Block) => {
    console.log(`Sent block at (${block.pos}) with height ${block.height}`);
    socket.emit("updateBlocks", {
      block: block.toJSON(),
      username: myUsername,
    });
  };

  const updateScoreCallback = (score: number) => {
    socket.emit("updateScore", { score, username: myUsername });
    console.log(`Emitting score: ${score} from ${myUsername}`);
    const playerScoreEl = document.getElementById("playerScore");
    if (playerScoreEl) {
      playerScoreEl.textContent = score.toString();
    }
  };

  const sendLayersCallback = (clearable: number) => {
    socket.emit("sendLayers", clearable);
  };

  const gameoverCallback = () => {
    socket.emit("gameOver", {});
  };

  const localTileset = new Tileset(
    Settings.mapHeight,
    Settings.mapWidth,
    updateTilesetCallback,
    updateScoreCallback,
    sendLayersCallback,
    gameoverCallback
  );

  let opponentBlocks: Block[] = [];

  const camera = new Camera();
  const localRenderer = new Renderer(localCanvas, localCtx);
  const opponentRenderer = new Renderer(opponentCanvas, opponentCtx);
  const inputHandler = new InputHandler(camera, localTileset);

  const gameTimer = new GameTimer(Settings.fallDelay, () => {
    if (!localTileset.playTetMode()) {
      localTileset.addTet(TetrominoGenerator.getRandomTetromino());
      localTileset.initTetMode();
    }
  });

  inputHandler.bindDefaultCameraControls();
  inputHandler.bindDefaultMovementControls();

  socket.on("startGame", (username: string) => {
    console.log(`Game started by server and from ${username}`);
  });

  socket.on("updateBlocks", (data: { block: string; username: string }) => {
    console.log(`Received placed blocks from ${data.username}`);
    const newBlock = Block.fromJSON(data.block);
    console.log(
      `Received block at (${newBlock.pos}) with height ${newBlock.height}`
    );
    opponentBlocks.push(newBlock);
  });

  socket.on("scoreUpdate", (data: { score: number; username: string }) => {
    console.log(`Received score update: ${data.score} from ${data.username}`);
    const opponentScoreEl = document.getElementById("opponentScore");
    if (opponentScoreEl) {
      opponentScoreEl.textContent = data.score.toString();
    }
  });

  socket.on("endGame", (result: { winner: boolean }) => {
    if (result.winner) {
      socket.emit("winGame", {});
      alert("You win!");
    } else {
      alert("You lost!");
    }
  });

  localTileset.initTetMode();
  localTileset.addTet(TetrominoGenerator.getRandomTetromino());
  localTileset.initTetMode();

  let lastTime = performance.now();
  const render = () => {
    const now = performance.now();
    const deltaTime = now - lastTime;
    lastTime = now;
    camera.update(deltaTime);
    localCtx.clearRect(0, 0, localCanvas.width, localCanvas.height);
    opponentCtx.clearRect(0, 0, opponentCanvas.width, opponentCanvas.height);

    localRenderer.renderTiles(localTileset.adj, camera.angle);
    localRenderer.renderWalls2(
      localTileset.placedBlocks,
      localTileset.activeTet,
      localTileset.activeTetGhost,
      camera.angle
    );

    opponentRenderer.renderTiles(localTileset.adj, Settings.initialAngle);
    opponentRenderer.renderWalls2(
      opponentBlocks,
      null,
      null,
      Settings.initialAngle
    );

    gameTimer.update();
    requestAnimationFrame(render);
  };

  render();
}
