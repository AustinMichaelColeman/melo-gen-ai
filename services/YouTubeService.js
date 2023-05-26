import { google } from "googleapis";

export class YouTubeService {
  constructor(accessToken) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    this.youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });
  }

  async fetchMultipleSongsMetadata(songSearchQueries) {
    const failed_queries = [];
    const songs_with_metadata = [];
    for (const query of songSearchQueries) {
      try {
        const metadata = await this.fetchSingleSongMetadata(query);
        songs_with_metadata.push(metadata);
      } catch (error) {
        console.error(`Error fetching metadata for query "${query}":`, error);
        failed_queries.push(query);
      }
    }
    return { songs_with_metadata, failed_queries };
  }

  async insertPlaylist(title) {
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
      return { playlist_id: response.data.id };
    } catch (error) {
      console.error(`Error creating playlist "${title}":`, error);
      throw error;
    }
  }

  async insertSongsIntoPlaylist(songs_with_metadata, playlist_id) {
    const successful_insertions = [];
    const failed_insertions = [];
    for (const song_with_metadata of songs_with_metadata) {
      try {
        const song = await this.insertSong(song_with_metadata, playlist_id);
        successful_insertions.push(song);
      } catch (error) {
        console.error(`Error inserting songs into playlist:`, error);
        failed_insertions.push(song_with_metadata);
      }
    }
    return { successful_insertions, failed_insertions };
  }

  async insertSong(song_with_metadata, playlist_id) {
    const { id, title } = song_with_metadata;
    try {
      const response = await this.youtube.playlistItems.insert({
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
      return song_with_metadata;
    } catch (error) {
      console.error(`Error adding song "${title}" to playlist:`, error);
      throw error;
    }
  }

  async fetchSingleSongMetadata(query) {
    try {
      const response = await this.youtube.search.list({
        part: "id",
        q: query,
        maxResults: 1,
        type: "video",
      });
      if (response.data.items.length === 0) {
        throw new Error("Song not found");
      }
      const videoDetails = response.data.items[0];
      return {
        id: videoDetails.id.videoId,
        query,
        title: videoDetails.snippet.title,
      };
    } catch (error) {
      console.error(`Error fetching metadata for query "${query}":`, error);
      throw error;
    }
  }
}
