/**
 * @jest-environment node
 */

// Mock next/server before importing middleware
jest.mock("next/server", () => {
  class MockNextRequest {
    nextUrl: URL;
    cookies: { get: (name: string) => { value: string } | undefined };

    constructor(url: string, init: { headers?: Headers } = {}) {
      const base = new URL(url);
      base.clone = () => new URL(base.toString());
      this.nextUrl = base;
      const cookieHeader = init.headers?.get("cookie") ?? "";
      const cookieMap: Record<string, string> = {};
      cookieHeader.split(";").forEach((part) => {
        const [k, v] = part.trim().split("=");
        if (k) cookieMap[k.trim()] = v?.trim() ?? "";
      });
      this.cookies = {
        get: (name: string) =>
          cookieMap[name] !== undefined ? { value: cookieMap[name] } : undefined,
      };
    }
  }

  const MockNextResponse = {
    redirect: (url: URL) => ({
      status: 307,
      headers: new Map([["location", url.toString()]]),
      headers: { get: (h: string) => (h === "location" ? url.toString() : null) },
    }),
    next: () => ({ status: 200, headers: { get: () => null } }),
  };

  return { NextResponse: MockNextResponse, NextRequest: MockNextRequest };
});

import { middleware } from "./middleware";

function makeRequest(pathname: string, hasCookie = false) {
  const headers = new Headers();
  if (hasCookie) headers.set("cookie", "refreshToken=sometoken");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { NextRequest } = require("next/server") as any;
  return new NextRequest(`http://localhost${pathname}`, { headers });
}

describe("middleware", () => {
  it("redirects unauthenticated user from /dashboard to /welcome with from param", () => {
    const req = makeRequest("/dashboard");
    const res = middleware(req as any);
    expect(res.status).toBe(307);
    const location = res.headers.get("location") as string;
    expect(location).toContain("/welcome");
    expect(location).toContain("from=");
  });

  it("redirects unauthenticated user from /tickets/123 to /welcome", () => {
    const req = makeRequest("/tickets/123");
    const res = middleware(req as any);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/welcome");
  });

  it("allows authenticated user through /dashboard", () => {
    const req = makeRequest("/dashboard", true);
    const res = middleware(req as any);
    expect(res.status).not.toBe(307);
  });

  it("redirects authenticated user from /welcome to /dashboard", () => {
    const req = makeRequest("/welcome", true);
    const res = middleware(req as any);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/dashboard");
  });

  it("allows unauthenticated user on /welcome", () => {
    const req = makeRequest("/welcome");
    const res = middleware(req as any);
    expect(res.status).not.toBe(307);
  });

  it("allows unauthenticated user on /check-email", () => {
    const req = makeRequest("/check-email");
    const res = middleware(req as any);
    expect(res.status).not.toBe(307);
  });

  it("redirects authenticated user from /register to /dashboard", () => {
    const req = makeRequest("/register", true);
    const res = middleware(req as any);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/dashboard");
  });

  it("allows authenticated user through /tickets/456", () => {
    const req = makeRequest("/tickets/456", true);
    const res = middleware(req as any);
    expect(res.status).not.toBe(307);
  });
});
