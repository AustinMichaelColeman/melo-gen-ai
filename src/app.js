import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import generatePlaylist from "../api/generatePlaylist.js";
import serveAiPluginJson from "../api/aiPlugin.js";

const app = express();

app.use(
  cors({
    origin: "https://chat.openai.com",
  })
);
app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/playlist/:username", generatePlaylist);
app.get("/.well-known/ai-plugin.json", serveAiPluginJson);

export default app;
