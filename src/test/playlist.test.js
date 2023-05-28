import createPlaylist from "../../api/playlist";
import { YouTubeService } from "../services/YouTubeService";
import { YouTubeAPIError } from "../errors/customErrors";

jest.mock("../services/YouTubeService");

// Mock console.error
console.error = jest.fn();

describe("createPlaylist", () => {
  it("creates a playlist successfully", async () => {
    const mockFetchSingleSongMetadata = jest
      .fn()
      .mockResolvedValue({ id: "123", title: "Test Song" });
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
        searchQueries: ["Test Song"],
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
      successful_insertions: [{ id: "123", title: "Test Song" }],
      failed_queries: [],
      failed_insertions: [],
    });
  });

  it("returns an error when playlist creation fails due to YouTubeAPIError", async () => {
    const mockFetchSingleSongMetadata = jest
      .fn()
      .mockResolvedValue({ id: "123", title: "Test Song" });
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
        searchQueries: ["Test Song"],
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
        searchQueries: ["Test Song"],
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
        searchQueries: ["Test Song"],
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
});
