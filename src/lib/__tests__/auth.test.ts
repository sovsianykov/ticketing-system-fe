import { login, register, refreshAccessToken, logout } from "../auth";

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockUser = {
  id: "1",
  email: "user@example.com",
  name: "User",
  isEmailVerified: true,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

afterEach(() => mockFetch.mockReset());

describe("login", () => {
  it("returns AuthResponse on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accessToken: "tok", user: mockUser }),
    });

    const result = await login({ email: "user@example.com", password: "pass" });
    expect(result).toEqual({ accessToken: "tok", user: mockUser });
  });

  it("throws with string message on failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Invalid credentials" }),
    });

    await expect(login({ email: "a@b.com", password: "wrong" })).rejects.toThrow("Invalid credentials");
  });

  it("joins array messages", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: ["too short", "needs uppercase"] }),
    });

    await expect(login({ email: "a@b.com", password: "x" })).rejects.toThrow("too short, needs uppercase");
  });

  it("uses fallback message when no message provided", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    await expect(login({ email: "a@b.com", password: "x" })).rejects.toThrow("Request failed");
  });
});

describe("register", () => {
  it("returns message on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Check your email" }),
    });

    const result = await register({ email: "a@b.com", password: "pass", name: "A" });
    expect(result).toEqual({ message: "Check your email" });
  });

  it("throws on failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Email already taken" }),
    });

    await expect(register({ email: "a@b.com", password: "pass" })).rejects.toThrow("Email already taken");
  });
});

describe("refreshAccessToken", () => {
  it("returns new access token", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accessToken: "new-tok" }),
    });

    const token = await refreshAccessToken();
    expect(token).toBe("new-tok");
  });

  it("throws on failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Token expired" }),
    });

    await expect(refreshAccessToken()).rejects.toThrow("Token expired");
  });
});

describe("logout", () => {
  it("resolves even if fetch throws", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network error"));
    await expect(logout()).resolves.toBeUndefined();
  });

  it("calls the logout endpoint", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    await logout();
    expect(mockFetch).toHaveBeenCalledWith("/api/auth/logout", expect.objectContaining({ method: "POST" }));
  });
});
