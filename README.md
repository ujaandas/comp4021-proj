# 🎮🧩 T3Dtris

**T3Dtris** is a fast-paced, multiplayer 3D twist on the classic Tetris game! Compete against other players in real-time as you rotate, drop, and battle your way to victory.

---

## 🚀 Features

- 🎮 **Multiplayer Mode**: Challenge both friends or foes online
- 🧠 **3D Tetris Gameplay**: Rotate the board for dynamic strategy and placing techniques
- 💥 **Garbage Attack System**: Send obstacles to rivals by clearing multiple lines
- ⚡ **Real-Time Interaction**: Powered by WebSockets for seamless multiplayer action
- 🕹️ **Cheat Mode**: Secret codes unlocks exclusive perks!

---

## 📦 Installation & Setup

```bash
npm install
npm run dev
```

---

## 🛠️ Tech Stack

- **Frontend**: HTML5 Canvas, TypeScript, Vite
- **Backend**: Node.js, Express
- **Database**: JSON (lol)
- **Real-Time Communication**: WebSockets via Socket.io

---

## 📂 Project Structure

```
├── README.md
├── data
│   ├── lobbies.json
│   └── users.json
├── package-lock.json
├── package.json
├── src
│   ├── client
│   │   ├── index.html
│   │   ├── scripts
│   │   │   ├── app.ts
│   │   │   └── components
│   │   │       ├── authPage.ts
│   │   │       ├── game
│   │   │       │   ├── assets
│   │   │       │   │   └── tetris.mp3
│   │   │       │   ├── components
│   │   │       │   │   ├── Block.ts
│   │   │       │   │   ├── Coordinate.ts
│   │   │       │   │   ├── Tetromino.ts
│   │   │       │   │   └── Wall.ts
│   │   │       │   ├── render
│   │   │       │   │   └── Renderer.ts
│   │   │       │   ├── tileset
│   │   │       │   │   ├── GEdge.ts
│   │   │       │   │   ├── GNode.ts
│   │   │       │   │   └── Tileset.ts
│   │   │       │   └── utils
│   │   │       │       ├── Camera.ts
│   │   │       │       ├── Colour.ts
│   │   │       │       ├── GameTimer.ts
│   │   │       │       ├── InputHandler.ts
│   │   │       │       ├── Settings.ts
│   │   │       │       └── TetGenerator.ts
│   │   │       ├── gameOverPage.ts
│   │   │       ├── gamePage.ts
│   │   │       ├── landingPage.ts
│   │   │       └── lobbyPage.ts
│   │   └── styles
│   ├── middleware
│   │   └── session.ts
│   ├── repository
│   │   ├── lobby.ts
│   │   └── users.ts
│   ├── routes
│   │   ├── auth.ts
│   │   └── index.ts
│   ├── server.ts
│   └── socket
│       ├── game.ts
│       ├── index.ts
│       └── lobby.ts
├── tsconfig.json
└── vite.config.ts

17 directories, 38 files, 3000+ lines of code
```

---

## 🎮 How to Play

- **Move**: WASD
- **Rotate**: Arrow Keys
- **Hard Drop**: `X`
- **Attack**: Clear multiple lines to send garbage rows

---

## 🏆 Game Over & Rankings

At the end of each match:

- 📊 Total lines cleared
- 🔁 Garbage rows sent & received
- 🏅 Winner declaration
- 📈 Leaderboard updates for competitive tracking

---

## 🏗️ Future Improvements

- 🧱 More interactive obstacles
- 👥 Expanded player count for battle royale Tetris
- 🎨 Optimized graphics and smoother animations
