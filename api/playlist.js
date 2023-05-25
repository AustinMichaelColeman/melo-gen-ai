import {
  addSongIdsTo,
  insertPlaylist,
  insertSongsIntoPlaylist,
} from "../src/services/youtubeAPI.js";

export default async function playlist(req, res) {
  const { title, songs } = req.body;
  // const username = req.query.username;

  const { code, ...createdPlaylist } = await createPlaylist(title, songs);

  res.status(code).json(createdPlaylist);
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
