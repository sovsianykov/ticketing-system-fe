const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Minimal polyfill so next/server can instantiate
if (typeof Request === "undefined") {
  const { Request, Response, Headers, fetch } = require("undici");
  global.Request = Request;
  global.Response = Response;
  global.Headers = Headers;
  global.fetch = fetch;
}
