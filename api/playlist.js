import { CustomError, YouTubeAPIError } from "../src/errors/customErrors.js";
import { YouTubeService } from "../src/services/YouTubeService.js";
import {
  validateAuthorizationHeader,
  validateRequestBody,
} from "../src/validators/requestValidators.js";
import { logError } from "../src/utils/logger.js";

const playlist_prefix = "https://music.youtube.com/browse/VL";
export default async function playlist(req, res) {
  try {
    const accessToken = validateAuthorizationHeader(req.headers.authorization);
    const { title, searchQueries, privacyStatus } = validateRequestBody(
      req.body
    );

    const createdPlaylist = await createPlaylist(
      accessToken,
      title,
      searchQueries,
      privacyStatus || "public"
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

async function createPlaylist(
  accessToken,
  title,
  searchQueries,
  privacyStatus
) {
  const youtubeService = new YouTubeService(accessToken);

  const playlist_id = await youtubeService.insertPlaylist(title, privacyStatus);
  if (!playlist_id) {
    throw new YouTubeAPIError("Failed to create playlist");
  }

  async function fetchSongMetadata(query) {
    try {
      const songMetadata = await youtubeService.fetchSingleSongMetadata(query);
      return { query, songMetadata };
    } catch (error) {
      logError(
        new YouTubeAPIError(error.message, error.code, { playlist_id, query })
      );
      return { query, songMetadata: null };
    }
  }

  const metadataPromises = searchQueries.map(fetchSongMetadata);

  const songMetadatas = Object.fromEntries(
    (await Promise.all(metadataPromises))
      .filter(({ songMetadata }) => songMetadata !== null)
      .map(({ query, songMetadata }) => [query, songMetadata])
  );

  const successful_insertions = [];

  // Insert songs into the playlist in the original order
  for (let i = 0; i < searchQueries.length; i++) {
    const query = searchQueries[i];
    const songMetadata = songMetadatas[query];
    if (songMetadata) {
      try {
        await youtubeService.insertSong(songMetadata, playlist_id);
        successful_insertions.push(songMetadata);
      } catch (error) {
        throw new YouTubeAPIError(error.message, error.code, {
          playlist_id,
          playlistUrl: `${playlist_prefix}${playlist_id}`,
          successful_insertions,
        });
      }
    }
  }

  const playlistUrl = `${playlist_prefix}${playlist_id}`;

  return {
    playlist_id,
    playlistUrl,
    successful_insertions,
    privacyStatus,
  };
}
