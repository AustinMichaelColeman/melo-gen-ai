import {
  addSongIdsTo,
  insertPlaylist,
  insertSongsIntoPlaylist,
} from "../src/services/youtubeAPI.js";

export default async function generatePlaylist(req, res) {
  const { title, songs } = req.body;
  console.log("title", title);
  console.log("songs", songs);
  const username = req.params.username;
  console.log("username", username);

  const { code, ...playlist } = await createPlaylist(title, songs);
  console.log("playlist", playlist);

  res.status(code).json({ playlist });
}

async function createPlaylist(title, songs) {
  const { songs_with_ids, failed_songs } = await addSongIdsTo(songs);

  const { playlist_id, error } = await insertPlaylist(title);

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
      message: "Error: Could not create playlist",
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
