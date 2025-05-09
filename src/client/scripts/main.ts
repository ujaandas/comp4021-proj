type User = {
  username: string;
};

let currentUser: User | null = null;

const appDiv = document.getElementById("app") as HTMLDivElement;

function renderContent(html: string): void {
  appDiv.innerHTML = html;
}

function renderLandingPage(): void {
  const landingHTML = `
    <div class="landing-page">
      <h1>t3dtris</h1>
      <p>
        Welcome to t3dtris, the ultimate 3D puzzle challenge!<br />
        Follow the instructions and click Play to get started.
      </p>
      <button id="play-button">Play</button>
    </div>
  `;
  renderContent(landingHTML);

  const playBtn = document.getElementById("play-button") as HTMLButtonElement;
  playBtn.addEventListener("click", onPlayClicked);
}

function onPlayClicked(): void {
  if (!currentUser) {
    showAuthPopup();
  } else {
    renderLobby();
  }
}

function showAuthPopup(): void {
  const overlay = document.createElement("div");
  overlay.id = "auth-overlay";
  document.body.appendChild(overlay);

  const popup = document.createElement("div");
  popup.id = "auth-popup";
  popup.innerHTML = `
    <button id="auth-close">&times;</button>
    <h2>Login</h2>
    <form id="login-form">
      <input type="text" id="login-username" placeholder="Username" required />
      <input type="password" id="login-password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <hr />
    <h2>Register</h2>
    <form id="register-form">
      <input type="text" id="reg-username" placeholder="Username" required />
      <input type="password" id="reg-password" placeholder="Password" required />
      <button type="submit">Register</button>
    </form>
    <p id="auth-message"></p>
  `;
  document.body.appendChild(popup);

  const closeBtn = document.getElementById("auth-close") as HTMLButtonElement;
  closeBtn.addEventListener("click", () => {
    removeAuthPopup();
  });

  const loginForm = document.getElementById("login-form") as HTMLFormElement;
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = (
      document.getElementById("login-username") as HTMLInputElement
    ).value;
    const password = (
      document.getElementById("login-password") as HTMLInputElement
    ).value;
    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        currentUser = data.user;
        showAuthMessage("Login successful!", false);
        removeAuthPopup();
        renderLobby();
      } else {
        showAuthMessage("Login error: " + data.error, true);
      }
    } catch (error) {
      showAuthMessage("Error during login.", true);
      console.error(error);
    }
  });

  const registerForm = document.getElementById(
    "register-form"
  ) as HTMLFormElement;
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = (
      document.getElementById("reg-username") as HTMLInputElement
    ).value;
    const password = (
      document.getElementById("reg-password") as HTMLInputElement
    ).value;
    try {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        showAuthMessage("Registration successful! Please log in.", false);
      } else {
        showAuthMessage("Registration error: " + data.error, true);
      }
    } catch (error) {
      showAuthMessage("Error during registration.", true);
      console.error(error);
    }
  });
}

function showAuthMessage(message: string, isError = false): void {
  const msgEl = document.getElementById("auth-message") as HTMLParagraphElement;
  if (msgEl) {
    msgEl.textContent = message;
    msgEl.style.color = isError ? "red" : "green";
  }
}

function removeAuthPopup(): void {
  const popup = document.getElementById("auth-popup");
  const overlay = document.getElementById("auth-overlay");
  if (popup) popup.remove();
  if (overlay) overlay.remove();
}

function renderLobby(): void {
  const lobbyHTML = `
    <div class="lobby">
      <h2>Welcome, ${currentUser?.username || ""}</h2>
      <p>This is the lobby. Await further instructions or join a room!</p>
      <button id="logout-button">Logout</button>
    </div>
  `;
  renderContent(lobbyHTML);

  const logoutBtn = document.getElementById(
    "logout-button"
  ) as HTMLButtonElement;
  logoutBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("/auth/logout", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        currentUser = null;
        renderLandingPage();
      } else {
        alert("Logout failed.");
      }
    } catch (error) {
      console.error("Error during logout", error);
      alert("Error during logout.");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderLandingPage();
});
