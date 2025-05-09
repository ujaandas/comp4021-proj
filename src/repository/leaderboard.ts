import { promises as fs } from "fs";
import path from "path";

export interface IPlacement {
  username: string;
  score: number;
}

const leaderboardFilePath = path.join(__dirname, "../../data/leaderboard.json");

export async function loadLeaderboard(): Promise<IPlacement[]> {
  try {
    const data = await fs.readFile(leaderboardFilePath, "utf8");
    return JSON.parse(data) as IPlacement[];
  } catch (error) {
    return [];
  }
}

export async function saveLeaderboard(
  leaderboard: IPlacement[]
): Promise<void> {
  await fs.writeFile(leaderboardFilePath, JSON.stringify(leaderboard, null, 2));
}
