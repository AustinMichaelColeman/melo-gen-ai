import path from "path";
import YAML from "js-yaml";
import { matchers } from "jest-json-schema";
import { resolveRefsAt } from "json-refs";
import createPlaylist from "../../api/playlist.js";
import { YouTubeService } from "../services/YouTubeService.js";
import { YouTubeAPIError } from "../errors/customErrors.js";

jest.mock("../services/YouTubeService");

console.error = jest.fn();

let resolvedSchemas;

// Resolve the references in the OpenAPI spec before all tests
beforeAll(async () => {
  const openApiSpecPath = path.resolve(__dirname, "../../config/openapi.yaml");
  const resolved = await resolveRefsAt(openApiSpecPath, {
    loaderOptions: {
      processContent: function (res, callback) {
        callback(null, YAML.load(res.text));
      },
    },
  });
  resolvedSchemas = resolved.resolved.components.schemas;
});

expect.extend(matchers);
describe("createPlaylist", () => {
  it("creates a playlist successfully", async () => {
    const mockFetchSingleSongMetadata = jest.fn().mockResolvedValue({
      id: "123",
      title: "Test Title",
      query: "Test Query",
    });
    const mockInsertPlaylist = jest.fn().mockResolvedValue("playlist123");
    const mockInsertSong = jest.fn().mockResolvedValue();

    YouTubeService.mockImplementation(() => {
      return {
        fetchSingleSongMetadata: mockFetchSingleSongMetadata,
        insertPlaylist: mockInsertPlaylist,
        insertSong: mockInsertSong,
      };
    });

    const req = {
      headers: {
        authorization: "Bearer accessToken",
      },
      body: {
        title: "Test Playlist",
        searchQueries: ["Test Query"],
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createPlaylist(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Playlist created successfully",
      playlist_id: "playlist123",
      playlistUrl: "https://music.youtube.com/browse/VLplaylist123",
      successful_insertions: [
        { id: "123", title: "Test Title", query: "Test Query" },
      ],
    });
  });

  it("returns an error when playlist creation fails due to YouTubeAPIError", async () => {
    const mockFetchSingleSongMetadata = jest.fn().mockResolvedValue({
      id: "123",
      title: "Test Title",
      query: "Test Query",
    });
    const mockInsertPlaylist = jest
      .fn()
      .mockRejectedValue(new YouTubeAPIError("Failed to create playlist", 429));
    const mockInsertSong = jest.fn();

    YouTubeService.mockImplementation(() => {
      return {
        fetchSingleSongMetadata: mockFetchSingleSongMetadata,
        insertPlaylist: mockInsertPlaylist,
        insertSong: mockInsertSong,
      };
    });

    const req = {
      headers: {
        authorization: "Bearer accessToken",
      },
      body: {
        title: "Test Playlist",
        searchQueries: ["Test Query"],
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createPlaylist(req, res);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to create playlist",
    });
  });

  it("returns an error when searchQueries is empty", async () => {
    const mockFetchSingleSongMetadata = jest.fn();
    const mockInsertPlaylist = jest.fn();
    const mockInsertSong = jest.fn();

    YouTubeService.mockImplementation(() => {
      return {
        fetchSingleSongMetadata: mockFetchSingleSongMetadata,
        insertPlaylist: mockInsertPlaylist,
        insertSong: mockInsertSong,
      };
    });

    const req = {
      headers: {
        authorization: "Bearer accessToken",
      },
      body: {
        title: "Test Playlist",
        searchQueries: [],
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createPlaylist(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid searchQueries",
    });
  });

  it("returns an error when title is missing", async () => {
    const mockFetchSingleSongMetadata = jest.fn();
    const mockInsertPlaylist = jest.fn();
    const mockInsertSong = jest.fn();

    YouTubeService.mockImplementation(() => {
      return {
        fetchSingleSongMetadata: mockFetchSingleSongMetadata,
        insertPlaylist: mockInsertPlaylist,
        insertSong: mockInsertSong,
      };
    });

    const req = {
      headers: {
        authorization: "Bearer accessToken",
      },
      body: {
        searchQueries: ["Test Query"],
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createPlaylist(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid title",
    });
  });

  it("returns an error when authorization token is missing", async () => {
    const mockFetchSingleSongMetadata = jest.fn();
    const mockInsertPlaylist = jest.fn();
    const mockInsertSong = jest.fn();

    YouTubeService.mockImplementation(() => {
      return {
        fetchSingleSongMetadata: mockFetchSingleSongMetadata,
        insertPlaylist: mockInsertPlaylist,
        insertSong: mockInsertSong,
      };
    });

    const req = {
      headers: {},
      body: {
        title: "Test Playlist",
        searchQueries: ["Test Query"],
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createPlaylist(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized",
    });
  });

  it("stops inserting songs as soon as an error occurs during insertion", async () => {
    const mockFetchSingleSongMetadata = jest
      .fn()
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
    const mockInsertPlaylist = jest.fn().mockResolvedValue("playlist123");
    const mockInsertSong = jest
      .fn()
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new YouTubeAPIError("Failed to insert song", 429));

    YouTubeService.mockImplementation(() => {
      return {
        fetchSingleSongMetadata: mockFetchSingleSongMetadata,
        insertPlaylist: mockInsertPlaylist,
        insertSong: mockInsertSong,
      };
    });

    const req = {
      headers: {
        authorization: "Bearer accessToken",
      },
      body: {
        title: "Test Playlist",
        searchQueries: ["Test Query 1", "Test Query 2", "Test Query 3"],
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

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

  describe("OpenAPI Schema Validation Tests", () => {
    it("responds with an object that matches the OpenAPI schema on success", async () => {
      const mockFetchSingleSongMetadata = jest.fn().mockResolvedValue({
        id: "123",
        title: "Test Title",
        query: "Test Query",
      });
      const mockInsertPlaylist = jest.fn().mockResolvedValue("playlist123");
      const mockInsertSong = jest.fn().mockResolvedValue();

      YouTubeService.mockImplementation(() => {
        return {
          fetchSingleSongMetadata: mockFetchSingleSongMetadata,
          insertPlaylist: mockInsertPlaylist,
          insertSong: mockInsertSong,
        };
      });

      const req = {
        headers: {
          authorization: "Bearer accessToken",
        },
        body: {
          title: "Test Playlist",
          searchQueries: ["Test Query"],
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await createPlaylist(req, res);

      // Validate the response against the schema
      expect(res.json.mock.calls[0][0]).toMatchSchema(
        resolvedSchemas.createPlaylistResponse
      );
    });

    it("responds with an object that matches the OpenAPI schema on failure when title is missing", async () => {
      const mockFetchSingleSongMetadata = jest.fn();
      const mockInsertPlaylist = jest.fn();
      const mockInsertSong = jest.fn();

      YouTubeService.mockImplementation(() => {
        return {
          fetchSingleSongMetadata: mockFetchSingleSongMetadata,
          insertPlaylist: mockInsertPlaylist,
          insertSong: mockInsertSong,
        };
      });

      const req = {
        headers: {
          authorization: "Bearer accessToken",
        },
        body: {
          searchQueries: ["Test Query"],
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await createPlaylist(req, res);

      // Validate the response against the schema
      expect(res.json.mock.calls[0][0]).toMatchSchema(
        resolvedSchemas.errorResponse
      );
    });

    it("validates the request body against the playlistRequest schema", async () => {
      const req = {
        headers: {
          authorization: "Bearer accessToken",
        },
        body: {
          title: "Test Playlist",
          searchQueries: ["Test Song"],
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await createPlaylist(req, res);

      expect(req.body).toMatchSchema(resolvedSchemas.playlistRequest);
    });

    it("validates the successful response against the createPlaylistResponse schema", async () => {
      const req = {
        headers: {
          authorization: "Bearer accessToken",
        },
        body: {
          title: "Test Playlist",
          searchQueries: ["Test Song"],
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

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
      const req = {
        headers: {
          authorization: "Bearer accessToken",
        },
        body: {
          searchQueries: ["Test Song"],
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await createPlaylist(req, res);

      expect(res.json.mock.calls[0][0]).toMatchSchema(
        resolvedSchemas.errorResponse
      );
    });

    it("validates the song metadata against the songMetadata schema", async () => {
      const req = {
        headers: {
          authorization: "Bearer accessToken",
        },
        body: {
          title: "Test Playlist",
          searchQueries: ["Test Song"],
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

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

      const successfulInsertions =
        res.json.mock.calls[0][0].successful_insertions;

      const songMetadata = successfulInsertions[0];
      expect(songMetadata).toMatchSchema(resolvedSchemas.songMetadata);
    });
  });
});
