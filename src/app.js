import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { handlePlaylistCreation } from "./controllers/playlistController.js";

const app = express();

app.use(
  cors({
    origin: "https://chat.openai.com",
  })
);
app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/playlist/:username", handlePlaylistCreation);

export default app;
