import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";

const app = express();
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
app.use(express.static(`${dirname}/../public`));
app.use(express.json());

const server = createServer(app);
server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
