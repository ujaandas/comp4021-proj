import { Router } from "express";
import authRoutes from "./auth";
import leaderboardRoutes from "./leaderboard";

const router = Router();

router.use("/auth", authRoutes);
router.use("/leaderboard", leaderboardRoutes);

export default router;
