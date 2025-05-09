export function renderLandingPage(onPlayClicked: () => void) {
  const html = `
    <div class="landing-page">
      <h1>t3dtris</h1>
      <p>
        Welcome to t3dtris, the ultimate 3D puzzle challenge!<br />
        Follow the instructions and click Play to get started.
      </p>
      <button id="play-button">Play</button>
    </div>
  `;
  const appDiv = document.getElementById("app") as HTMLDivElement;
  appDiv.innerHTML = html;
  const playBtn = document.getElementById("play-button") as HTMLButtonElement;
  playBtn.addEventListener("click", onPlayClicked);
}
