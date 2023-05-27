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
    const fetched_song_metadata = [];
    const failed_queries = [];
    for (const query of songSearchQueries) {
      const metadata = await this.fetchSingleSongMetadata(query);
      if (metadata) {
        fetched_song_metadata.push(metadata);
      } else {
        failed_queries.push(query);
      }
    }
    return { fetched_song_metadata, failed_queries };
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
    }
    return playlist_id;
  }

  async insertSongsIntoPlaylist(multiple_songs_metadata, playlist_id) {
    const successful_insertions = [];
    const failed_insertions = [];
    for (const single_song_metadata of multiple_songs_metadata) {
      const success = await this.insertSong(single_song_metadata, playlist_id);
      if (success) {
        successful_insertions.push(single_song_metadata);
      } else {
        console.error(
          `Error inserting song ${JSON.stringify(
            single_song_metadata
          )} into playlist`
        );
        failed_insertions.push(single_song_metadata);
      }
    }
    return { successful_insertions, failed_insertions };
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
      return true;
    } catch (error) {
      console.error(`Error adding song "${title}" to playlist:`, error);
      return false;
    }
  }

  async fetchSingleSongMetadata(query) {
    const searchParams = {
      part: "id,snippet",
      q: query,
      maxResults: 1,
      type: "video",
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
      return null;
    }
  }
}
