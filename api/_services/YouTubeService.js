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

  async addSongIdsTo(songs) {
    const failed_songs = [];
    const songs_with_ids = [];
    for (const song of songs) {
      try {
        const song_id = await this.getSongID(song);
        songs_with_ids.push({
          id: song_id,
          title: song,
        });
      } catch (error) {
        console.error(`Error getting ID for song "${song}":`, error);
        failed_songs.push({
          id: null,
          title: song,
        });
      }
    }
    return { songs_with_ids, failed_songs };
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

  async insertSongsIntoPlaylist(songs_with_ids, playlist_id) {
    const songs_entered = [];
    const songs_failed = [];
    for (const song_with_id of songs_with_ids) {
      try {
        const song = await this.insertSong(song_with_id, playlist_id);
        songs_entered.push(song);
      } catch (error) {
        console.error(`Error inserting songs into playlist:`, error);
        songs_failed.push(song_with_id);
      }
    }
    return { songs_entered, songs_failed };
  }

  async insertSong(song_with_id, playlist_id) {
    const { id, title } = song_with_id;
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
      return song_with_id;
    } catch (error) {
      console.error(`Error adding song "${title}" to playlist:`, error);
      throw error;
    }
  }

  async getSongID(song) {
    try {
      const response = await this.youtube.search.list({
        part: "id",
        q: song,
        maxResults: 1,
        type: "video",
      });
      if (response.data.items.length === 0) {
        throw new Error("Song not found");
      }
      return response.data.items[0].id.videoId;
    } catch (error) {
      console.error(`Error getting song ID for "${song}":`, error);
      throw error;
    }
  }
}
