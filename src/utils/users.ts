import { promises as fs } from "fs";
import path from "path";

export interface IUser {
  username: string;
  passwordHash: string;
}

const dataFilePath = path.join(__dirname, "../../data/users.json");

export async function loadUsers(): Promise<Record<string, IUser>> {
  try {
    const data = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(data) as Record<string, IUser>;
  } catch (error) {
    console.warn("Error loading users:", error);
    return {};
  }
}

export async function saveUsers(users: Record<string, IUser>): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2));
}
