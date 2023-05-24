const express = require("express");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");

const PORT = 3000;

const app = express();
app.use(
  cors({
    origin: "https://chat.openai.com",
  })
);
app.use(bodyParser.json());

app.post("/playlist/:username", (req, res) => {
  const { title, songs } = req.body;
  const username = req.params.username;

  // Generate a playlist based on the provided title and song names
  const playlist = generatePlaylist(title, songs);

  // Return the generated playlist
  res.status(200).json({ playlist });
});

function generatePlaylist(title, songs) {
  const playlist_prefix = "https://music.youtube.com/browse/VL";

  const playlist_id = createPlaylist(title);

  for (song of songs) {
    insertSong(song, playlist_id);
  }

  const playlistUrl = `${playlist_prefix}${playlist_id}`;
  return {
    title,
    playlistUrl,
  };
}

function createPlaylist(title) {
  console.log("created playlist", title);
  return "PLHue5YJSxY0g9gtEbaV6DhOuGrMhLz4IE";
}

function insertSong(song, playlist_id) {
  console.log("insertSong", song);
  const songID = getSongID(song);
  console.log("inserted", songID, "into playlist", playlist_id);
  return true;
}

function getSongID(song) {
  console.log("getSongID", song);
  const { title, artist } = song;
  const songID = `ID-${title}`;
  console.log(`searched for ${title} by ${artist} and got ID`, songID);
  return songID;
}

app.get("/logo.png", (req, res) => {
  res.sendFile(__dirname + "/logo.png");
});

app.get("/.well-known/ai-plugin.json", (req, res) => {
  fs.readFile("./.well-known/ai-plugin.json", "utf8", (err, data) => {
    if (err) throw err;
    res.setHeader("Content-Type", "application/json");
    res.send(data);
  });
});

app.get("/openapi.yaml", (req, res) => {
  fs.readFile("./openapi.yaml", "utf8", (err, data) => {
    if (err) throw err;
    res.setHeader("Content-Type", "text/yaml");
    res.send(data);
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
