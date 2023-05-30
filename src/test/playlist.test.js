import path from "path";
import YAML from "js-yaml";
import { matchers } from "jest-json-schema";
import { resolveRefsAt } from "json-refs";
import createPlaylist from "../../api/playlist.js";
import { YouTubeService } from "../services/YouTubeService.js";
import { YouTubeAPIError } from "../errors/customErrors.js";
import replacePlaceholders from "../utils/replacePlaceholders.js";

jest.mock("../services/YouTubeService");

console.error = jest.fn();

let resolvedSchemas;
let songLimit = 3;

// Resolve the references in the OpenAPI spec before all tests
beforeAll(async () => {
  const openApiSpecPath = path.resolve(__dirname, "../../config/openapi.yaml");
  const resolved = await resolveRefsAt(openApiSpecPath, {
    loaderOptions: {
      processContent: function (res, callback) {
        const openapiYaml = replacePlaceholders(res.text, {
          __SERVER_URL__: process.env.SERVER_URL,
          __SONG_LIMIT__: process.env.SONG_LIMIT,
        });
        callback(null, YAML.load(openapiYaml));
      },
    },
  });
  resolvedSchemas = resolved.resolved.components.schemas;
  songLimit = Number(process.env.SONG_LIMIT);
  if (isNaN(songLimit)) {
    throw new Error("SONG_LIMIT must be a number");
  }
});

expect.extend(matchers);

describe("createPlaylist", () => {
  let req, res, mockFetchSingleSongMetadata, mockInsertPlaylist, mockInsertSong;

  beforeEach(() => {
    req = {
      headers: {
        authorization: "Bearer accessToken",
      },
      body: {
        title: "Test Playlist",
        searchQueries: ["Test Query"],
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockFetchSingleSongMetadata = jest.fn();
    mockInsertPlaylist = jest.fn();
    mockInsertSong = jest.fn();

    YouTubeService.mockImplementation(() => {
      return {
        fetchSingleSongMetadata: mockFetchSingleSongMetadata,
        insertPlaylist: mockInsertPlaylist,
        insertSong: mockInsertSong,
      };
    });
  });

  it("creates a playlist successfully", async () => {
    mockFetchSingleSongMetadata.mockResolvedValue({
      id: "123",
      title: "Test Title",
      query: "Test Query",
    });
    mockInsertPlaylist.mockResolvedValue("playlist123");

    await createPlaylist(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      playlist_id: "playlist123",
      playlistUrl: "https://music.youtube.com/browse/VLplaylist123",
      successful_insertions: [
        { id: "123", title: "Test Title", query: "Test Query" },
      ],
    });
  });

  it("returns an error when playlist creation fails due to YouTubeAPIError", async () => {
    mockFetchSingleSongMetadata.mockResolvedValue({
      id: "123",
      title: "Test Title",
      query: "Test Query",
    });
    mockInsertPlaylist.mockRejectedValue(
      new YouTubeAPIError("Failed to create playlist", 429)
    );

    await createPlaylist(req, res);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to create playlist",
    });
  });

  it("returns an error when searchQueries is empty", async () => {
    req.body.searchQueries = [];

    await createPlaylist(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: `Invalid searchQueries. Must include between 1 and ${process.env.SONG_LIMIT} (inclusively) search queries.`,
    });
  });

  it("returns an error when title is missing", async () => {
    delete req.body.title;

    await createPlaylist(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid title. Title must be between 1 and 150 characters.",
    });
  });

  it("returns an error when playlist title is empty", async () => {
    req.body.title = "";

    await createPlaylist(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid title. Title must be between 1 and 150 characters.",
    });
  });

  it("returns an error when playlist title exceeds maximum length", async () => {
    req.body.title = "a".repeat(151);

    await createPlaylist(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid title. Title must be between 1 and 150 characters.",
    });
  });

  it("returns an error when authorization token is missing", async () => {
    delete req.headers.authorization;

    await createPlaylist(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized",
    });
  });

  it("stops inserting songs as soon as an error occurs during insertion", async () => {
    mockFetchSingleSongMetadata
      .mockResolvedValueOnce({
        id: "123",
        title: "Test Title 1",
        query: "Test Query 1",
      })
      .mockResolvedValueOnce({
        id: "456",
        title: "Test Title 2",
        query: "Test Query 2",
      });
    mockInsertPlaylist.mockResolvedValue("playlist123");
    mockInsertSong
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new YouTubeAPIError("Failed to insert song", 429));

    req.body.searchQueries = ["Test Query 1", "Test Query 2", "Test Query 3"];

    await createPlaylist(req, res);

    expect(mockFetchSingleSongMetadata).toHaveBeenCalledTimes(2);
    expect(mockInsertSong).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to insert song",
      playlist_id: "playlist123",
      playlistUrl: "https://music.youtube.com/browse/VLplaylist123",
      successful_insertions: [
        { id: "123", title: "Test Title 1", query: "Test Query 1" },
      ],
    });
  });

  it(`does not allow more than ${process.env.SONG_LIMIT} songs to be queried at a time`, async () => {
    req.body.searchQueries = Array.from(
      { length: songLimit + 1 },
      (_, i) => `Test Query ${i + 1}`
    );

    await createPlaylist(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: `Invalid searchQueries. Must include between 1 and ${process.env.SONG_LIMIT} (inclusively) search queries.`,
    });
  });

  describe("OpenAPI Schema Validation Tests", () => {
    it("responds with an object that matches the OpenAPI schema on success", async () => {
      mockFetchSingleSongMetadata.mockResolvedValue({
        id: "123",
        title: "Test Title",
        query: "Test Query",
      });
      mockInsertPlaylist.mockResolvedValue("playlist123");

      await createPlaylist(req, res);

      // Validate the response against the schema
      expect(res.json.mock.calls[0][0]).toMatchSchema(
        resolvedSchemas.createPlaylistResponse
      );
    });

    it("responds with an object that matches the OpenAPI schema on failure when title is missing", async () => {
      delete req.body.title;

      await createPlaylist(req, res);

      // Validate the response against the schema
      expect(res.json.mock.calls[0][0]).toMatchSchema(
        resolvedSchemas.errorResponse
      );
    });

    it("validates the request body against the playlistRequest schema", async () => {
      await createPlaylist(req, res);

      expect(req.body).toMatchSchema(resolvedSchemas.playlistRequest);
    });

    it("validates the successful response against the createPlaylistResponse schema", async () => {
      // Mock the YouTubeService methods
      YouTubeService.mockImplementation(() => {
        return {
          insertPlaylist: jest.fn().mockResolvedValue("test_playlist_id"),
          insertSong: jest.fn().mockResolvedValue(),
          fetchSingleSongMetadata: jest.fn().mockResolvedValue({
            id: "test_song_id",
            query: "test_query",
            title: "test_title",
          }),
        };
      });

      await createPlaylist(req, res);

      expect(res.json.mock.calls[0][0]).toMatchSchema(
        resolvedSchemas.createPlaylistResponse
      );
    });

    it("validates the error response against the errorResponse schema when title is missing", async () => {
      delete req.body.title;

      await createPlaylist(req, res);

      expect(res.json.mock.calls[0][0]).toMatchSchema(
        resolvedSchemas.errorResponse
      );
    });

    it("validates the song metadata against the songMetadata schema", async () => {
      // Mock the YouTubeService methods
      YouTubeService.mockImplementation(() => {
        return {
          insertPlaylist: jest.fn().mockResolvedValue("test_playlist_id"),
          insertSong: jest.fn().mockResolvedValue(),
          fetchSingleSongMetadata: jest.fn().mockResolvedValue({
            id: "test_song_id",
            query: "test_query",
            title: "test_title",
          }),
        };
      });

      await createPlaylist(req, res);

      expect(res.json.mock.calls[0][0].successful_insertions[0]).toMatchSchema(
        resolvedSchemas.songMetadata
      );
    });
  });
});
