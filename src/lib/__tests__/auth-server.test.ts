import { mapAuthResponse, callBackendAuth, callBackendRegister, callBackendRefresh, callBackendLogout } from "../auth-server";
import type { BackendAuthResponse } from "@/types/auth";

const mockFetch = jest.fn();
global.fetch = mockFetch;

const backendUser = {
  id: "1",
  email: "test@example.com",
  name: "Test",
  isEmailVerified: true,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

describe("mapAuthResponse", () => {
  it("maps snake_case to camelCase", () => {
    const input: BackendAuthResponse = {
      access_token: "tok",
      refresh_token: "ref",
      user: backendUser,
    };
    expect(mapAuthResponse(input)).toEqual({ accessToken: "tok", user: backendUser });
  });
});

describe("callBackendAuth", () => {
  afterEach(() => mockFetch.mockReset());

  it("returns ok:true with data on success", async () => {
    const responseData: BackendAuthResponse = { access_token: "tok", refresh_token: "ref", user: backendUser };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => responseData,
    });

    const result = await callBackendAuth("/auth/login", { email: "a@b.com", password: "pass" });
    expect(result).toEqual({ ok: true, data: responseData });
  });

  it("returns ok:false with message on failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: "Invalid credentials" }),
    });

    const result = await callBackendAuth("/auth/login", { email: "a@b.com", password: "wrong" });
    expect(result).toEqual({ ok: false, status: 401, message: "Invalid credentials" });
  });

  it("uses fallback message when no message in response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const result = await callBackendAuth("/auth/login", {});
    expect(result).toMatchObject({ ok: false, message: "Authentication failed" });
  });
});

describe("callBackendRegister", () => {
  afterEach(() => mockFetch.mockReset());

  it("returns ok:true with confirmation message on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Check your email" }),
    });

    const result = await callBackendRegister({ email: "a@b.com", password: "pass" });
    expect(result).toEqual({ ok: true, data: { message: "Check your email" } });
  });

  it("returns ok:false on failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ message: "Email taken" }),
    });

    const result = await callBackendRegister({ email: "a@b.com", password: "pass" });
    expect(result).toEqual({ ok: false, status: 409, message: "Email taken" });
  });
});

describe("callBackendRefresh", () => {
  afterEach(() => mockFetch.mockReset());

  it("returns ok:true with data and setCookie on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: "new-tok", user: backendUser }),
      headers: { get: (h: string) => (h === "set-cookie" ? "refreshToken=abc" : null) },
    });

    const result = await callBackendRefresh("old-token");
    expect(result).toMatchObject({ ok: true, setCookie: "refreshToken=abc" });
  });

  it("returns ok:false on failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: "Token expired" }),
    });

    const result = await callBackendRefresh("bad-token");
    expect(result).toEqual({ ok: false, status: 401, message: "Token expired" });
  });
});

describe("callBackendLogout", () => {
  afterEach(() => mockFetch.mockReset());

  it("calls the logout endpoint and ignores errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network error"));
    await expect(callBackendLogout("tok")).resolves.toBeUndefined();
  });

  it("calls logout with the refresh token", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await callBackendLogout("my-refresh-token");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/logout"),
      expect.objectContaining({ body: JSON.stringify({ refreshToken: "my-refresh-token" }) })
    );
  });
});
