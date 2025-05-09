import { Router, Request, Response } from "express";
import { loadUsers, saveUsers, IUser } from "../repository/users";
import bcrypt from "bcrypt";

export interface ICustomSession {
  user?: IUser;
}

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required." });
  }

  const users = await loadUsers();

  if (users[username]) {
    return res.status(409).json({ error: "User already exists." });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const newUser: IUser = {
    username,
    passwordHash,
  };

  users[username] = newUser;
  await saveUsers(users);

  res.json({ success: true });
});

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required." });
  }

  const users = await loadUsers();
  const user = users[username];

  if (!user) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  const reqSession = req.session as ICustomSession;
  reqSession.user = user;

  res.json({ success: true, user: { username } });
});

router.get("/profile", (req: Request, res: Response) => {
  const session = req.session as ICustomSession;

  if (session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  res.json({ user: session.user });
});

router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy((err: Error | null) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

export default router;
