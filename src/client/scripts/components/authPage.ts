type User = { username: string };

export async function login(
  username: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return await res.json();
}

export async function register(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return await res.json();
}

export async function checkProfile(): Promise<User | null> {
  try {
    const res = await fetch("/auth/profile", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      return data.user || null;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error checking profile:", error);
    return null;
  }
}

export function showAuthPopup(onSuccess: (user: User) => void) {
  const style = `
    <style>
      #auth-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 1000;
        backdrop-filter: blur(5px);
      }
      
      #auth-popup {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #0f0f1a;
        border: 4px solid #4cc9f0;
        border-radius: 10px;
        padding: 30px;
        width: 90%;
        max-width: 400px;
        z-index: 1001;
        font-family: 'Press Start 2P', cursive;
        color: white;
        box-shadow: 0 0 20px rgba(76, 201, 240, 0.5);
      }
      
      #auth-popup h2 {
        color: #ff4754;
        text-align: center;
        margin-bottom: 20px;
        font-size: 1.5rem;
      }
      
      #auth-popup hr {
        border: none;
        border-top: 2px solid #4cc9f0;
        margin: 25px 0;
      }
      
      #auth-popup form {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      #auth-popup input {
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid #4cc9f0;
        padding: 12px;
        color: white;
        font-family: 'Press Start 2P', cursive;
        border-radius: 5px;
        outline: none;
      }
      
      #auth-popup input:focus {
        border-color: #ff4754;
      }
      
      #auth-popup button[type="submit"] {
        background: #4cc9f0;
        color: black;
        border: none;
        padding: 12px;
        font-family: 'Press Start 2P', cursive;
        font-size: 0.9rem;
        cursor: pointer;
        text-transform: uppercase;
        transition: all 0.2s;
        margin-top: 10px;
      }
      
      #auth-popup button[type="submit"]:hover {
        background: #3ab0d6;
      }
      
      #auth-close {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 5px 10px;
      }
      
      #auth-close:hover {
        color: #ff4754;
      }
      
      #auth-message {
        margin-top: 20px;
        font-size: 0.7rem;
        text-align: center;
        min-height: 20px;
      }
      
      .tetris-blocks-auth {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 20px;
        opacity: 0.5;
      }
      
      .block-auth {
        width: 20px;
        height: 20px;
      }
      
      .i-block { background-color: #00f0f0; }
      .o-block { background-color: #f0f000; }
      .t-block { background-color: #a000f0; }
      .l-block { background-color: #f0a000; }
      .j-block { background-color: #0000f0; }
      .s-block { background-color: #00f000; }
      .z-block { background-color: #f00000; }
    </style>
  `;

  const overlay = document.createElement("div");
  overlay.id = "auth-overlay";
  document.body.appendChild(overlay);

  const popup = document.createElement("div");
  popup.id = "auth-popup";
  popup.innerHTML = `
    ${style}
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
    <div class="tetris-blocks-auth">
      <div class="block-auth i-block"></div>
      <div class="block-auth o-block"></div>
      <div class="block-auth t-block"></div>
      <div class="block-auth l-block"></div>
      <div class="block-auth j-block"></div>
      <div class="block-auth s-block"></div>
      <div class="block-auth z-block"></div>
    </div>
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
      const data = await login(username, password);
      if (data.success && data.user) {
        removeAuthPopup();
        onSuccess(data.user);
      } else {
        showAuthMessage("Login error: " + data.error, true);
      }
    } catch (error) {
      showAuthMessage("Error during login.", true);
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
      const data = await register(username, password);
      if (data.success) {
        showAuthMessage("Registration successful! Please log in.", false);
      } else {
        showAuthMessage("Registration error: " + data.error, true);
      }
    } catch (error) {
      showAuthMessage("Error during registration.", true);
    }
  });
}

function showAuthMessage(message: string, isError = false) {
  const msgEl = document.getElementById("auth-message") as HTMLParagraphElement;
  if (msgEl) {
    msgEl.textContent = message;
    msgEl.style.color = isError ? "#ff4754" : "#00f000";
  }
}

function removeAuthPopup() {
  const popup = document.getElementById("auth-popup");
  const overlay = document.getElementById("auth-overlay");
  if (popup) popup.remove();
  if (overlay) overlay.remove();
}