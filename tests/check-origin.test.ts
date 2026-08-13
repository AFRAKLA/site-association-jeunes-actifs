import test from "node:test";
import assert from "node:assert/strict";
import { isOriginAllowed } from "../lib/check-origin.ts";

function makeRequest(url: string, headers: Record<string, string>): Request {
  return new Request(url, { headers });
}

test("allows a matching Origin header", () => {
  const req = makeRequest("https://jeunes-actifs.example/api/admin/login", {
    origin: "https://jeunes-actifs.example",
  });
  assert.equal(isOriginAllowed(req), true);
});

test("rejects a cross-site Origin header", () => {
  const req = makeRequest("https://jeunes-actifs.example/api/admin/login", {
    origin: "https://evil.example",
  });
  assert.equal(isOriginAllowed(req), false);
});

test("falls back to Referer when Origin is absent", () => {
  const req = makeRequest("https://jeunes-actifs.example/api/admin/login", {
    referer: "https://jeunes-actifs.example/admin",
  });
  assert.equal(isOriginAllowed(req), true);
});

test("rejects a cross-site Referer when Origin is absent", () => {
  const req = makeRequest("https://jeunes-actifs.example/api/admin/login", {
    referer: "https://evil.example/attack-page",
  });
  assert.equal(isOriginAllowed(req), false);
});

test("rejects when neither Origin nor Referer is present", () => {
  const req = makeRequest("https://jeunes-actifs.example/api/admin/login", {});
  assert.equal(isOriginAllowed(req), false);
});

test("rejects a malformed Referer without throwing", () => {
  const req = makeRequest("https://jeunes-actifs.example/api/admin/login", {
    referer: "not-a-url",
  });
  assert.doesNotThrow(() => isOriginAllowed(req));
  assert.equal(isOriginAllowed(req), false);
});

test("works correctly on localhost (dev)", () => {
  const req = makeRequest("http://localhost:3000/api/admin/login", {
    origin: "http://localhost:3000",
  });
  assert.equal(isOriginAllowed(req), true);
});
