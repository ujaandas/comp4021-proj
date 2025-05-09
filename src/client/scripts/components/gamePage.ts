import { InputHandler } from "./game/utils/InputHandler";
import { Renderer } from "./game/render/Renderer";
import { Tileset } from "./game/tileset/Tileset";
import { Camera } from "./game/utils/Camera";
import { Settings } from "./game/utils/Settings";
import { GameTimer } from "./game/utils/GameTimer";
import { TetrominoGenerator } from "./game/utils/TetGenerator";
import { io } from "socket.io-client";
import { Block } from "./game/components/Block";
import { Tetromino } from "./game/components/Tetromino";
import music from "./game/assets/tetris.mp3";
import { renderGameOverPage } from "./gameOverPage";
import { Colour } from "./game/utils/Colour";

export function renderGamePage(myUsername: string) {
  const appDiv = document.getElementById("app") as HTMLDivElement;
  if (!appDiv) {
    console.error("No element with id 'app' found.");
    return;
  }

  let running = true;

  const html = `
    <div class="game-container">
      <div class="score-overlay">
        <div class="score">
          <div class="player-score">
            <span class="label">Your Score</span>
            <span id="playerScore">0</span>
          </div>
          <div class="opponent-score">
            <span class="label">Opponent's Score</span>
            <span id="opponentScore">0</span>
          </div>
        </div>
      </div>

      <div class="canvas-container">
        <canvas id="localCanvas"></canvas>
      </div>

      <div id="tetrominoPreview">
        <span class="label">Next Block</span>
      </div>
    </div>
  `;

  const css = `
  <style>
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

  /* General Reset */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* Body Styling */
  body {
    background-color: #0f0f1a;
    color: #fff;
    font-family: 'Press Start 2P', cursive;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

  /* Game Container */
  .game-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    gap: 20px;
    position: relative;
  }

  /* Score Overlay */
  .score-overlay {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 90%;
    max-width: 800px;
    margin-bottom: 20px;
  }

  .score {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .player-score,
  .opponent-score {
    text-align: center;
    padding: 10px 20px;
    border: 3px solid #4cc9f0;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.6);
    box-shadow: 0 0 10px #4cc9f0, 0 0 20px #4cc9f0;
  }

  .player-score {
    color: #4cc9f0;
  }

  .opponent-score {
    color: #ff4754;
    border-color: #ff4754;
    box-shadow: 0 0 10px #ff4754, 0 0 20px #ff4754;
  }

  .score .label {
    display: block;
    font-size: 1.2rem;
    margin-bottom: 5px;
  }

  .score span {
    font-size: 2.5rem;
  }

  /* Canvas Container */
  .canvas-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 70%;
  }

  canvas {
  width: 90vw; 
  height: 80vh; 
  max-width: 1000px; 
  max-height: 800px; 
  background: rgba(0, 0, 0, 0.8);
  border: 5px solid #4cc9f0;
  box-shadow: 0 0 20px #4cc9f0, 0 0 40px #4cc9f0;
}


  /* Tetromino Preview */
  #tetrominoPreview {
    width: 150px;
    height: 150px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  #tetrominoPreview .label {
    font-size: 1.2rem;
    margin-bottom: 10px;
    color: #fff;
  }
</style>
  `;

  appDiv.innerHTML = html + css;

  const localCanvas = document.getElementById(
    "localCanvas"
  ) as HTMLCanvasElement;
  if (!localCanvas) {
    console.error("Missing canvas elements.");
    return;
  }

  localCanvas.width = window.innerWidth / 2;
  localCanvas.height = window.innerHeight;

  const localCtx = localCanvas.getContext("2d");
  if (!localCtx) {
    console.error("Cannot get canvas contexts.");
    return;
  }

  const socket = io();

  const backgroundMusic = new Audio(music);
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.2;

  backgroundMusic
    .play()
    .catch((err) => console.error("Error playing background music:", err));

  const tetQueue: Tetromino[] = [
    TetrominoGenerator.getRandomTetromino(),
    TetrominoGenerator.getRandomTetromino(),
    TetrominoGenerator.getRandomTetromino(),
  ];

  function getNextTetromino(): Tetromino {
    const nextTet = tetQueue.shift()!;
    tetQueue.push(TetrominoGenerator.getRandomTetromino());
    updateTetPreviewUI();
    return nextTet;
  }

  function updateTetPreviewUI() {
    const tetPreviewEl = document.getElementById("tetrominoPreview");
    if (tetPreviewEl) {
      tetPreviewEl.style.display = "none";
      tetPreviewEl.innerHTML = tetQueue
        .map((tet) => `<div>${tet.style}</div>`)
        .join("");
    }
  }

  const updateTilesetCallback = (block: Block) => {
    socket.emit("updateBlocks", {
      block: block.toJSON(),
      username: myUsername,
    });
  };

  const updateScoreCallback = (score: number) => {
    socket.emit("updateScore", { score, username: myUsername });
    const playerScoreEl = document.getElementById("playerScore");
    if (playerScoreEl) {
      playerScoreEl.textContent = score.toString();
    }
  };

  const trollCallback = () => {
    console.log("TROLLED! ADDING RANDOM BLOCKS!");
    const random = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < random; i++) {
      const newBlock = Block.makeBlockOnPoint(
        Math.floor(Math.random() * Settings.mapWidth),
        Math.floor(Math.random() * Settings.mapHeight),
        0,
        Colour.random()
      );
      socket.emit("updateBlocks", {
        block: newBlock.toJSON(),
        username: myUsername,
      });
    }
  };

  const sendLayersCallback = (clearable: number) => {
    socket.emit("sendLayers", clearable);
  };

  const gameoverCallback = () => {
    running = false;
    const myScore = document.getElementById("playerScore");
    const opponentScore = document.getElementById("opponentScore");
    const myScoreValue = myScore ? parseInt(myScore.textContent || "0") : 0;
    const opponentScoreValue = opponentScore
      ? parseInt(opponentScore.textContent || "0")
      : 0;
    const gameResult = {
      username: myUsername,
      myScore: myScoreValue,
      opponentScore: opponentScoreValue,
    };
    console.log(`Game over emitted by ${myUsername} with result:`, gameResult);
    socket.emit("gameOver", gameResult);
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
  const inputHandler = new InputHandler(camera, localTileset, trollCallback);

  const gameTimer = new GameTimer(Settings.fallDelay, () => {
    if (!localTileset.playTetMode()) {
      const newTet = getNextTetromino();
      localTileset.addTet(newTet);
      localTileset.initTetMode();
    }
  });

  inputHandler.bindDefaultCameraControls();
  inputHandler.bindDefaultMovementControls();

  socket.on("startGame", (username: string) => {
    console.log(`Game started by server and from ${username}`);
  });

  socket.on("updateBlocks", (data: { block: string; username: string }) => {
    const newBlock = Block.fromJSON(data.block);
    opponentBlocks.push(newBlock);
  });

  socket.on("scoreUpdate", (data: { score: number; username: string }) => {
    const opponentScoreEl = document.getElementById("opponentScore");
    if (opponentScoreEl) {
      opponentScoreEl.textContent = data.score.toString();
    }
  });

  socket.on(
    "gameOver",
    async (data: {
      winner: boolean;
      username: string;
      myScore: number;
      opponentScore: number;
    }) => {
      console.log(`Game over emitted by ${data.username} with result:`, data);

      try {
        const response = await fetch("/api/leaderboard");
        const leaderboard = await response.json();

        renderGameOverPage(
          data.winner,
          data.username,
          data.myScore,
          data.opponentScore,
          leaderboard
        );
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        renderGameOverPage(
          data.winner,
          data.username,
          data.myScore,
          data.opponentScore
        );
      }
    }
  );

  localTileset.initTetMode();
  localTileset.addTet(getNextTetromino());
  localTileset.initTetMode();
  updateTetPreviewUI();

  let lastTime = performance.now();
  const render = () => {
    if (!running) return;

    const now = performance.now();
    const deltaTime = now - lastTime;
    lastTime = now;
    camera.update(deltaTime);
    localCtx.clearRect(0, 0, localCanvas.width, localCanvas.height);

    localRenderer.renderTiles(localTileset.adj, camera.angle);
    localRenderer.renderWalls2(
      localTileset.placedBlocks,
      localTileset.activeTet,
      localTileset.activeTetGhost,
      camera.angle
    );

    // opponentRenderer.renderTiles(localTileset.adj, Settings.initialAngle);
    // opponentRenderer.renderWalls2(
    //   opponentBlocks,
    //   null,
    //   null,
    //   Settings.initialAngle
    // );

    gameTimer.update();
    requestAnimationFrame(render);
  };

  render();
}
