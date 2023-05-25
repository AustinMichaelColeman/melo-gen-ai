import { YouTubeService } from "../services/YouTubeService.js";

export default async function playlist(req, res) {
  const { title, songs } = req.body;
  const authHeader = req.headers.authorization;
  const accessToken = authHeader && authHeader.split(" ")[1];
  if (!accessToken) {
    res.status(401).json({ error: "Access token is required" });
    return;
  }

  const youTubeService = new YouTubeService(accessToken);
  const { code, ...createdPlaylist } = await createPlaylist(
    youTubeService,
    title,
    songs
  );

  res.status(code).json(createdPlaylist);
}

async function createPlaylist(youtubeService, title, songs) {
  const { songs_with_ids, failed_songs } = await youtubeService.addSongIdsTo(
    songs
  );

  let playlist_id;
  try {
    const response = await youtubeService.insertPlaylist(title);
    playlist_id = response.playlist_id;
  } catch (error) {
    return { code: 500, error: error.message, failed_songs };
  }

  const { songs_entered, songs_failed } =
    await youtubeService.insertSongsIntoPlaylist(songs_with_ids, playlist_id);

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
