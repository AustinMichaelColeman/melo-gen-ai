export async function addSongIdsTo(songs) {
  const failed_songs = [];
  const songs_with_ids = [];
  for (const song of songs) {
    try {
      const song_id = await getSongID(song);
      songs_with_ids.push({
        id: song_id,
        title: song,
      });
    } catch (e) {
      console.log("Error getting song id for", song, "Error:", e);
      failed_songs.push({
        id: null,
        title: song,
      });
    }
  }
  return { songs_with_ids, failed_songs };
}

export async function insertPlaylist(title) {
  console.log("created playlist", title);
  return { playlist_id: "PLHue5YJSxY0g9gtEbaV6DhOuGrMhLz4IE" };
}

export async function insertSongsIntoPlaylist(songs_with_ids, playlist_id) {
  const songs_entered = [];
  const songs_failed = [];
  for (const song_with_id of songs_with_ids) {
    try {
      const song = await insertSong(song_with_id, playlist_id);
      songs_entered.push(song);
    } catch (e) {
      console.log("failed to insert song", song_with_id, "Error:", e);
      songs_failed.push(song_with_id);
    }
  }
  return { songs_entered, songs_failed };
}

function insertSong(song_with_id, playlist_id) {
  const { id, title } = song_with_id;
  // Mocking YouTube API
  if (title === "ENERGY by Disclosure") {
    throw Error("Failed to insert song into playlist");
  }
  console.log("inserted", id, "into playlist", playlist_id);
  return song_with_id;
}

async function getSongID(song) {
  // Mocking YouTube API
  let songID = "";
  if (song === "Musician by Porter Robinson") {
    songID = "q-74HTjRbuY";
  } else if (song === "ENERGY by Disclosure") {
    songID = "nwO6hyeNGlE";
  } else {
    throw Error("Error getting song ID");
  }
  console.log(`searched for ${song} got ID`, songID);
  return songID;
}
