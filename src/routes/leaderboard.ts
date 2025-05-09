import { Router, Request, Response } from "express";
import {
  loadLeaderboard,
  saveLeaderboard,
  IPlacement,
} from "../repository/leaderboard";

const router = Router();

router.post("/leaderboard/add", async (req: Request, res: Response) => {
  const { username, score } = req.body;

  if (!username || score === undefined) {
    return res.status(400).json({ error: "Username and score required." });
  }

  const leaderboard = await loadLeaderboard();

  const existingIndex = leaderboard.findIndex(
    (entry) => entry.username === username
  );

  if (existingIndex !== -1) {
    if (score > leaderboard[existingIndex].score) {
      leaderboard[existingIndex].score = score;
    } else {
      return res
        .status(409)
        .json({ error: "Score must be higher than existing score." });
    }
  } else {
    leaderboard.push({ username, score } as IPlacement);
  }

  leaderboard.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.username.localeCompare(b.username);
  });

  await saveLeaderboard(leaderboard);
  res.json({ success: true, leaderboard });
});

router.get("/leaderboard", async (req: Request, res: Response) => {
  const leaderboard = await loadLeaderboard();
  res.json({ leaderboard });
});

export default router;
