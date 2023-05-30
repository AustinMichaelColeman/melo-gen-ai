import { google } from "googleapis";
import { YouTubeAPIError } from "../errors/customErrors.js";

export class YouTubeService {
  constructor(accessToken) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    this.youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });
  }

  async insertPlaylist(title) {
    let playlist_id = null;
    try {
      const response = await this.youtube.playlists.insert({
        part: "snippet,status",
        requestBody: {
          snippet: {
            title: title,
          },
          status: {
            privacyStatus: "public",
          },
        },
      });
      playlist_id = response.data.id;
    } catch (error) {
      console.error("Error creating playlist", title, error);
      throw new YouTubeAPIError(
        error.response?.data?.error?.message,
        error.response?.status
      );
    }
    return playlist_id;
  }

  async insertSong(single_song_metadata, playlist_id) {
    const { id, title } = single_song_metadata;
    try {
      await this.youtube.playlistItems.insert({
        part: "snippet",
        requestBody: {
          snippet: {
            playlistId: playlist_id,
            resourceId: {
              kind: "youtube#video",
              videoId: id,
            },
          },
        },
      });
    } catch (error) {
      console.error(`Error adding song "${title}" to playlist:`, error);
      throw new YouTubeAPIError(
        error.response?.data?.error?.message,
        error.response?.status
      );
    }
  }

  async fetchSingleSongMetadata(query) {
    const searchParams = {
      part: "id,snippet",
      q: query,
      maxResults: 1,
      type: "video",
      videoCategoryId: "10",
    };

    try {
      const response = await this.youtube.search.list(searchParams);

      const items = response.data.items;
      if (items.length === 0) {
        console.error(`No song found for query "${query}"`);
        return null;
      }

      const videoDetails = items[0];
      const songMetadata = {
        id: videoDetails.id.videoId,
        query,
        title: videoDetails.snippet.title,
      };

      return songMetadata;
    } catch (error) {
      console.error(`Error fetching metadata for query "${query}":`, error);
      throw new YouTubeAPIError(
        error.response?.data?.error?.message,
        error.response?.status
      );
    }
  }
}
