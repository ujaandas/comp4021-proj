import express from "express"
import { createServer } from "http"

const app = express()
app.use(express.static(`${__dirname}/../public`))
app.use(express.json())

const server = createServer(app)
server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000")
});

