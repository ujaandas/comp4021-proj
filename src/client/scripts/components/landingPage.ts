export function renderLandingPage(onPlayClicked: () => void) {
  const html = `
    <div class="landing-page">
      <div class="tetris-logo">t3dtris</div>
      <div class="game-description">
        Welcome to <span class="highlight">t3dtris</span>, the ultimate 3D puzzle challenge!<br />
        Rotate and place the falling blocks to complete layers.
      </div>
      <div class="instructions">
        <div class="instruction-item">← → : Move</div>
        <div class="instruction-item">↑ : Rotate</div>
        <div class="instruction-item">↓ : Speed Up</div>
        <div class="instruction-item">Space : Drop</div>
      </div>
      <button id="play-button" class="neon-button">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        PLAY
      </button>
      <div class="tetris-blocks">
        <div class="block i-block"></div>
        <div class="block o-block"></div>
        <div class="block t-block"></div>
        <div class="block l-block"></div>
        <div class="block j-block"></div>
        <div class="block s-block"></div>
        <div class="block z-block"></div>
      </div>
    </div>
  `;

  const style = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
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
      
      .landing-page {
        text-align: center;
        max-width: 800px;
        padding: 2rem;
        position: relative;
        z-index: 1;
      }
      
      .tetris-logo {
        font-size: 5rem;
        margin-bottom: 2rem;
        color: #ff4754;
        text-shadow: 0 0 10px #ff4754, 0 0 20px #ff4754, 0 0 30px #ff4754;
        animation: pulse 1.5s infinite alternate;
      }
      
      .game-description {
        margin-bottom: 3rem;
        line-height: 1.6;
        font-size: 1.2rem;
      }
      
      .highlight {
        color: #4cc9f0;
      }
      
      .instructions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 1.5rem;
        margin-bottom: 3rem;
      }
      
      .instruction-item {
        background: rgba(255, 255, 255, 0.1);
        padding: 1rem;
        border-radius: 5px;
        min-width: 150px;
      }
      
      .neon-button {
        position: relative;
        display: inline-block;
        padding: 15px 30px;
        color: #4cc9f0;
        text-transform: uppercase;
        letter-spacing: 4px;
        text-decoration: none;
        font-size: 1.5rem;
        overflow: hidden;
        transition: 0.2s;
        background: transparent;
        border: none;
        font-family: 'Press Start 2P', cursive;
        cursor: pointer;
        margin-bottom: 3rem;
      }
      
      .neon-button:hover {
        color: #fff;
        background: #4cc9f0;
        box-shadow: 0 0 10px #4cc9f0, 0 0 40px #4cc9f0, 0 0 80px #4cc9f0;
        transition-delay: 0.1s;
      }
      
      .neon-button span {
        position: absolute;
        display: block;
      }
      
      .neon-button span:nth-child(1) {
        top: 0;
        left: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #4cc9f0);
      }
      
      .neon-button:hover span:nth-child(1) {
        left: 100%;
        transition: 1s;
      }
      
      .neon-button span:nth-child(3) {
        bottom: 0;
        right: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(270deg, transparent, #4cc9f0);
      }
      
      .neon-button:hover span:nth-child(3) {
        right: 100%;
        transition: 1s;
        transition-delay: 0.5s;
      }
      
      .neon-button span:nth-child(2) {
        top: -100%;
        right: 0;
        width: 2px;
        height: 100%;
        background: linear-gradient(180deg, transparent, #4cc9f0);
      }
      
      .neon-button:hover span:nth-child(2) {
        top: 100%;
        transition: 1s;
        transition-delay: 0.25s;
      }
      
      .neon-button span:nth-child(4) {
        bottom: -100%;
        left: 0;
        width: 2px;
        height: 100%;
        background: linear-gradient(360deg, transparent, #4cc9f0);
      }
      
      .neon-button:hover span:nth-child(4) {
        bottom: 100%;
        transition: 1s;
        transition-delay: 0.75s;
      }
      
      .tetris-blocks {
        display: flex;
        justify-content: center;
        gap: 1rem;
        flex-wrap: wrap;
      }
      
      .block {
        width: 40px;
        height: 40px;
        border: 2px solid rgba(255, 255, 255, 0.3);
      }
      
      .i-block { background-color: #00f0f0; }
      .o-block { background-color: #f0f000; }
      .t-block { background-color: #a000f0; }
      .l-block { background-color: #f0a000; }
      .j-block { background-color: #0000f0; }
      .s-block { background-color: #00f000; }
      .z-block { background-color: #f00000; }
      
      @keyframes pulse {
        from {
          transform: scale(1);
          text-shadow: 0 0 10px #ff4754, 0 0 20px #ff4754;
        }
        to {
          transform: scale(1.05);
          text-shadow: 0 0 15px #ff4754, 0 0 30px #ff4754, 0 0 45px #ff4754;
        }
      }
      
      .landing-page::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
          radial-gradient(circle at 20% 30%, rgba(76, 201, 240, 0.1) 0%, transparent 20%),
          radial-gradient(circle at 80% 70%, rgba(255, 71, 84, 0.1) 0%, transparent 20%);
        z-index: -1;
      }
    </style>
  `;

  const appDiv = document.getElementById("app") as HTMLDivElement;
  appDiv.innerHTML = html + style;
  const playBtn = document.getElementById("play-button") as HTMLButtonElement;
  playBtn.addEventListener("click", onPlayClicked);
}