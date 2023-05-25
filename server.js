import express from "express";
import cors from "cors";
import fs from "fs";
import bodyParser from "body-parser";

const PORT = 3000;

const app = express();

/*
Right now the YouTube API is mocked. I plan to use actual tests to mock
the API but this was just how I got started.

Here's an example curl I'm using to test it:

curl --location 'http://localhost:3000/playlist/:username' \
--header 'Content-Type: application/json' \
--data '{
    "title": "Test",
    "songs": ["Musician by Porter Robinson", "ENERGY by Disclosure", "Look at the Sky by Porter Robinson"]
}'

I have some hardcoded YouTube URLs too.

*/

app.use(
  cors({
    origin: "https://chat.openai.com",
  })
);
app.use(bodyParser.json());

app.post("/playlist/:username", async (req, res) => {
  const { title, songs } = req.body;
  console.log("title", title);
  console.log("songs", songs);
  const username = req.params.username;
  console.log("username", username);

  // Generate a playlist based on the provided title and song names
  const { code, ...playlist } = await generatePlaylist(title, songs);
  console.log("playlist", playlist);

  res.status(code).json({ playlist });
});

async function generatePlaylist(title, songs) {
  const { songs_with_ids, failed_songs } = await addSongIdsTo(songs);

  const { playlist_id, error } = await createPlaylist(title);

  if (error) {
    return { code: 500, error, failed_songs };
  }

  const { songs_entered, songs_failed } = await insertSongsIntoPlaylist(
    songs_with_ids,
    playlist_id
  );

  if (songs_entered.length == 0) {
    return {
      code: 500,
      message: "Error: No songs were added to the playlist",
      failed_songs: [...failed_songs, ...songs_failed],
    };
  }

  const playlist_prefix = "https://music.youtube.com/browse/VL";
  const playlistUrl = `${playlist_prefix}${playlist_id}`;
  return {
    code: 200,
    message: "Playlist created successfully",
    playlist_id,
    playlistUrl,
    songs_entered,
    failed_songs: [...failed_songs, ...songs_failed],
  };
}
async function addSongIdsTo(songs) {
  const failed_songs = [];
  const songs_with_ids = [];
  for (const song of songs) {
    try {
      const song_id = await getSongID(song);
      songs_with_ids.push({
        id: song_id,
        title: song,
      });
    } catch (e) {
      console.log("Error getting song id for", song, "Error:", e);
      failed_songs.push({
        id: null,
        title: song,
      });
    }
  }
  return { songs_with_ids, failed_songs };
}

async function createPlaylist(title) {
  console.log("created playlist", title);
  return { playlist_id: "PLHue5YJSxY0g9gtEbaV6DhOuGrMhLz4IE" };
}

async function insertSongsIntoPlaylist(songs_with_ids, playlist_id) {
  const songs_entered = [];
  const songs_failed = [];
  for (const song_with_id of songs_with_ids) {
    try {
      const song = await insertSong(song_with_id, playlist_id);
      songs_entered.push(song);
    } catch (e) {
      console.log("failed to insert song", song, "Error:", e);
      songs_failed.push(song_with_id);
    }
  }
  return { songs_entered, songs_failed };
}

function insertSong(song_with_id, playlist_id) {
  const { id, title } = song_with_id;
  // Mocking YouTube API
  if (title === "ENERGY by Disclosure") {
    throw Error("Failed to insert song into playlist");
  }
  console.log("inserted", id, "into playlist", playlist_id);
  return song_with_id;
}

async function getSongID(song) {
  // Mocking YouTube API
  let songID = "";
  if (song === "Musician by Porter Robinson") {
    songID = "q-74HTjRbuY";
  } else if (song === "ENERGY by Disclosure") {
    songID = "nwO6hyeNGlE";
  } else {
    throw Error("Error getting song ID");
  }
  console.log(`searched for ${song} got ID`, songID);
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
