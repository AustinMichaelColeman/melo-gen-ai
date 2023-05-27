import { InternalServerError } from "../src/errors/customErrors.js";
import { YouTubeService } from "../src/services/YouTubeService.js";
import {
  validateAuthorizationHeader,
  validateRequestBody,
} from "../src/validators/requestValidators.js";
import { logError } from "../src/utils/logger.js";

export default async function playlist(req, res) {
  try {
    const accessToken = validateAuthorizationHeader(req.headers.authorization);
    const { title, searchQueries } = validateRequestBody(req.body);

    const createdPlaylist = await createPlaylist(
      accessToken,
      title,
      searchQueries
    );

    res.status(200).json(createdPlaylist);
  } catch (error) {
    logError(error);
    res.status(error.code || 500).json({ error: error.message });
  }
}

async function createPlaylist(accessToken, title, searchQueries) {
  const youtubeService = new YouTubeService(accessToken);

  const { fetched_song_metadata, failed_queries } =
    await youtubeService.fetchMultipleSongsMetadata(searchQueries);

  if (fetched_song_metadata.length === 0) {
    throw new InternalServerError(
      "All song fetch queries failed",
      failed_queries
    );
  }

  const playlist_id = await youtubeService.insertPlaylist(title);

  if (!playlist_id) {
    throw new InternalServerError("Failed to insert playlist", failed_queries);
  }

  const { successful_insertions, failed_insertions } =
    await youtubeService.insertSongsIntoPlaylist(
      fetched_song_metadata,
      playlist_id
    );

  if (successful_insertions.length === 0) {
    throw new InternalServerError("All song insert queries failed", {
      failed_queries,
      failed_insertions,
    });
  }

  const playlist_prefix = "https://music.youtube.com/browse/VL";
  const playlistUrl = `${playlist_prefix}${playlist_id}`;

  if (successful_insertions.length > 0 && failed_insertions.length > 0) {
    console.error("Some song insert queries failed");
    return {
      message: "Playlist created with some failures",
      playlist_id,
      playlistUrl,
      successful_insertions,
      failed_queries,
      failed_insertions,
    };
  }

  return {
    message: "Playlist created successfully",
    playlist_id,
    playlistUrl,
    successful_insertions,
    failed_queries,
    failed_insertions,
  };
}
