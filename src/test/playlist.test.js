import createPlaylist from "../../api/playlist.js";
import { YouTubeService } from "../services/YouTubeService.js";
import { YouTubeAPIError } from "../errors/customErrors.js";

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

  it("stops inserting songs as soon as an error occurs during insertion", async () => {
    const mockFetchSingleSongMetadata = jest
      .fn()
      .mockResolvedValueOnce({ id: "123", title: "Test Song 1" })
      .mockResolvedValueOnce({ id: "456", title: "Test Song 2" });
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
        searchQueries: ["Test Song 1", "Test Song 2", "Test Song 3"],
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
      successful_insertions: [{ id: "123", title: "Test Song 1" }],
    });
  });
});
