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

export function showAuthPopup(onSuccess: (user: User) => void) {
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
    msgEl.style.color = isError ? "red" : "green";
  }
}

function removeAuthPopup() {
  const popup = document.getElementById("auth-popup");
  const overlay = document.getElementById("auth-overlay");
  if (popup) popup.remove();
  if (overlay) overlay.remove();
}
