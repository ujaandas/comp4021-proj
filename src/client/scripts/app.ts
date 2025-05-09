import { renderLandingPage } from "./components/landingPage.js";
import { checkProfile, showAuthPopup } from "./components/auth.js";
import { renderLobby } from "./components/lobby.js";

type User = { username: string };

let currentUser: User | null = null;

function onPlayClicked() {
  if (!currentUser) {
    showAuthPopup((user: User) => {
      currentUser = user;
      renderLobby(currentUser.username, onLogout);
    });
  } else {
    renderLobby(currentUser.username, onLogout);
  }
}

function onLogout() {
  currentUser = null;
  renderLandingPage(onPlayClicked);
}

document.addEventListener("DOMContentLoaded", async () => {
  const user = await checkProfile();
  if (user) {
    currentUser = user;
    renderLobby(currentUser.username, onLogout);
  } else {
    renderLandingPage(onPlayClicked);
  }
});
