export default async function openapi(req, res) {
  const openapiYaml = `
openapi: 3.0.1
info:
  title: Smart Playlist Generator Plugin
  description: A plugin that allows users to create YouTube Music playlists by providing a playlist title and a list of songs.
  version: v1
servers:
  - url: ${process.env.SERVER_URL}
paths:
  /playlist:
    post:
      operationId: createPlaylist
      summary: Create a playlist
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/createPlaylistRequest"
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/createPlaylistResponse"
        "500":
          description: Error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/createPlaylistErrorResponse"

components:
  schemas:
    createPlaylistRequest:
      type: object
      required:
        - title
        - songs
      properties:
        title:
          type: string
          description: The title of the playlist. If the user doesn't specify a title, make up a title that makes sense given the content of the playlist.
        songs:
          type: array
          items:
            type: string
            description: A search string representing a song to search for on YouTube Music
          description: The list of songs in the playlist.

    createPlaylistResponse:
      type: object
      properties:
        message:
          type: string
          description: A message about the status of the playlist creation.
        playlist_id:
          type: string
          description: The ID of the generated playlist.
        playlistUrl:
          type: string
          description: The URL of the generated playlist.
        songs_entered:
          type: array
          items:
            $ref: "#/components/schemas/songWithId"
          description: The list of songs successfully added to the playlist.
        failed_songs:
          type: array
          items:
            $ref: "#/components/schemas/songWithId"
          description: The list of songs that failed to be added to the playlist. If a song has a null ID that means searching for the song failed. If a song has an ID, that means inserting it into the playlist failed.

    createPlaylistErrorResponse:
      type: object
      properties:
        error:
          type: string
          description: A message about the error that occurred.
        failed_songs:
          type: array
          items:
            $ref: "#/components/schemas/songWithId"
          description: The list of songs that failed to be added to the playlist.

    songWithId:
      type: object
      required:
        - title
      properties:
        id:
          type: string
          description: The ID of the song.
        title:
          type: string
          description: The title of the song.
`;
  res.setHeader("Content-Type", "text/yaml");
  res.send(openapiYaml);
}
