import { promises as fs } from "fs";
import path from "path";

export interface ILobby {
  id: string;
  player1: string;
  player2: string | null;
}

const dataFilePath = path.join(__dirname, "../../data/lobbies.json");

export async function loadLobbies(): Promise<ILobby[]> {
  try {
    const data = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(data) as ILobby[];
  } catch (error) {
    return [];
  }
}

export async function saveLobbies(lobbies: ILobby[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(lobbies, null, 2));
}
