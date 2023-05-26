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

  const { songs_with_metadata, failed_queries } =
    await youtubeService.fetchMultipleSongsMetadata(searchQueries);

  let playlist_id;
  try {
    const response = await youtubeService.insertPlaylist(title);
    playlist_id = response.playlist_id;
  } catch (error) {
    console.error("Failed to insert playlist");
    return { code: 500, error: error.message, failed_queries };
  }

  const { successful_insertions, failed_insertions } =
    await youtubeService.insertSongsIntoPlaylist(
      songs_with_metadata,
      playlist_id
    );

  if (successful_insertions.length == 0) {
    console.error("Failed to create playlist");
    return {
      code: 500,
      message: "Error: Could not create playlist",
      failed_queries,
      failed_insertions,
    };
  }

  const playlist_prefix = "https://music.youtube.com/browse/VL";
  const playlistUrl = `${playlist_prefix}${playlist_id}`;
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
