const registerForm = document.getElementById(
  "register-form"
) as HTMLFormElement;
const loginForm = document.getElementById("login-form") as HTMLFormElement;
const logoutButton = document.getElementById(
  "logout-button"
) as HTMLButtonElement;
const messageDiv = document.getElementById("message") as HTMLDivElement;

function showMessage(message: string, isError = false) {
  messageDiv.textContent = message;
  messageDiv.style.color = isError ? "red" : "green";
}

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = (document.getElementById("reg-username") as HTMLInputElement)
    .value;
  const password = (document.getElementById("reg-password") as HTMLInputElement)
    .value;

  try {
    const res = await fetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (data.success) {
      showMessage("Registration successful! You can now log in.");
    } else {
      showMessage("Registration error: " + data.error, true);
    }
  } catch (error) {
    showMessage("Error during registration.", true);
    console.error(error);
  }
});

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
      showMessage("Login successful! Welcome, " + data.user.username);
    } else {
      showMessage("Login error: " + data.error, true);
    }
  } catch (error) {
    showMessage("Error during login.", true);
    console.error(error);
  }
});

logoutButton.addEventListener("click", async () => {
  try {
    const res = await fetch("/auth/logout", {
      method: "POST",
    });

    const data = await res.json();
    if (data.success) {
      showMessage("Logged out successfully.");
    } else {
      showMessage("Logout failed.", true);
    }
  } catch (error) {
    showMessage("Error during logout.", true);
    console.error(error);
  }
});
