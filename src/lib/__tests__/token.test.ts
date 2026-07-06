import { REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_MAX_AGE } from "../token";

describe("token constants", () => {
  it("REFRESH_TOKEN_COOKIE is refreshToken", () => {
    expect(REFRESH_TOKEN_COOKIE).toBe("refreshToken");
  });

  it("REFRESH_TOKEN_MAX_AGE is 7 days in seconds", () => {
    expect(REFRESH_TOKEN_MAX_AGE).toBe(60 * 60 * 24 * 7);
  });
});
