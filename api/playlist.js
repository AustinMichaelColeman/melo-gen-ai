import { CustomError, YouTubeAPIError } from "../src/errors/customErrors.js";
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
    if (error instanceof CustomError) {
      res
        .status(error.code || 500)
        .json({ error: error.message, ...error.details });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
}

async function createPlaylist(accessToken, title, searchQueries) {
  const youtubeService = new YouTubeService(accessToken);

  let playlist_id;
  const successful_insertions = [];

  for (const query of searchQueries) {
    let songMetadata;
    try {
      songMetadata = await youtubeService.fetchSingleSongMetadata(query);
      if (songMetadata) {
        // Create the playlist after fetching the first song
        if (!playlist_id) {
          playlist_id = await youtubeService.insertPlaylist(title);
          if (!playlist_id) {
            throw new YouTubeAPIError("Failed to create playlist");
          }
        }

        // Insert the song into the playlist
        await youtubeService.insertSong(songMetadata, playlist_id);
        successful_insertions.push(songMetadata);
      }
    } catch (error) {
      const errorDetails = {};

      if (playlist_id) {
        const playlist_prefix = "https://music.youtube.com/browse/VL";
        const playlistUrl = `${playlist_prefix}${playlist_id}`;
        errorDetails.playlist_id = playlist_id;
        errorDetails.playlistUrl = playlistUrl;
        errorDetails.successful_insertions = successful_insertions;
      }

      throw new YouTubeAPIError(error.message, error.code, errorDetails);
    }
  }

  const playlist_prefix = "https://music.youtube.com/browse/VL";
  const playlistUrl = `${playlist_prefix}${playlist_id}`;

  return {
    playlist_id,
    playlistUrl,
    successful_insertions,
  };
}
