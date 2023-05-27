import { YouTubeService } from "../services/YouTubeService.js";

export default async function playlist(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.error("Authorization header is required");
    res.status(401).json({ error: "Authorization header is required" });
    return;
  }

  const { title, searchQueries } = req.body;
  if (
    !title ||
    !searchQueries ||
    (Array.isArray(searchQueries) && searchQueries.length === 0)
  ) {
    console.error(
      "Title and at least one search query are required in the request body"
    );
    res
      .status(400)
      .json({ error: "Title and at least one search query are required" });
    return;
  }

  const authParts = authHeader.split(" ");
  if (authParts.length !== 2 || authParts[0].toLowerCase() !== "bearer") {
    console.error("Invalid authorization format. Expected 'Bearer <token>'");
    res.status(401).json({
      error: "Invalid authorization format. Expected 'Bearer <token>'",
    });
    return;
  }

  const accessToken = authParts[1];
  const { code, ...createdPlaylist } = await createPlaylist(
    accessToken,
    title,
    searchQueries
  );

  res.status(code).json(createdPlaylist);
}

async function createPlaylist(accessToken, title, searchQueries) {
  const youtubeService = new YouTubeService(accessToken);

  const { fetched_song_metadata, failed_queries } =
    await youtubeService.fetchMultipleSongsMetadata(searchQueries);

  if (fetched_song_metadata.length === 0) {
    console.error("All song fetch queries failed");
    return { code: 500, failed_queries };
  }

  const playlist_id = await youtubeService.insertPlaylist(title);

  if (!playlist_id) {
    console.error("Failed to insert playlist");
    return { code: 500, failed_queries };
  }

  const { successful_insertions, failed_insertions } =
    await youtubeService.insertSongsIntoPlaylist(
      fetched_song_metadata,
      playlist_id
    );

  if (successful_insertions.length === 0) {
    console.error("All song insert queries failed");
    return { code: 500, failed_queries, failed_insertions };
  }

  const playlist_prefix = "https://music.youtube.com/browse/VL";
  const playlistUrl = `${playlist_prefix}${playlist_id}`;

  if (successful_insertions.length > 0 && failed_insertions.length > 0) {
    console.error("Some song insert queries failed");
    return {
      code: 200,
      message: "Playlist created with some failures",
      playlist_id,
      playlistUrl,
      failed_queries,
      failed_insertions,
      successful_insertions,
    };
  }

  return {
    code: 200,
    message: "Playlist created successfully",
    playlist_id,
    playlistUrl,
    successful_insertions,
    failed_queries,
    failed_insertions,
  };
}
