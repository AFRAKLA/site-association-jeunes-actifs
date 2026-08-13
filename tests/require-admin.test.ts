import test from "node:test";
import assert from "node:assert/strict";

process.env.ADMIN_SESSION_SECRET = "test-secret-do-not-use-in-production";

const { createSessionToken, SESSION_COOKIE_NAME } = await import("../lib/admin-session.ts");
const { requireAdmin } = await import("../lib/require-admin.ts");

const URL_ADMIN_ROUTE = "https://jeunes-actifs.example/api/admin/actualites/list";

function makeRequest(headers: Record<string, string>): Request {
  return new Request(URL_ADMIN_ROUTE, { method: "POST", headers });
}

test("rejects a request with no cookie and no session (401)", async () => {
  const req = makeRequest({ origin: "https://jeunes-actifs.example" });
  const result = requireAdmin(req);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 401);
});

test("rejects a request with a valid session but a cross-site Origin (403)", async () => {
  const token = createSessionToken();
  const req = makeRequest({
    origin: "https://evil.example",
    cookie: `${SESSION_COOKIE_NAME}=${token}`,
  });
  const result = requireAdmin(req);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 403);
});

test("rejects a request with an invalid/tampered session cookie (401)", async () => {
  const req = makeRequest({
    origin: "https://jeunes-actifs.example",
    cookie: `${SESSION_COOKIE_NAME}=garbage.value`,
  });
  const result = requireAdmin(req);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 401);
});

test("accepts a request with a valid session and matching Origin", async () => {
  const token = createSessionToken();
  const req = makeRequest({
    origin: "https://jeunes-actifs.example",
    cookie: `${SESSION_COOKIE_NAME}=${token}`,
  });
  const result = requireAdmin(req);
  assert.equal(result.ok, true);
});

test("parses the session cookie correctly among several other cookies", async () => {
  const token = createSessionToken();
  const req = makeRequest({
    origin: "https://jeunes-actifs.example",
    cookie: `other_cookie=abc; ${SESSION_COOKIE_NAME}=${token}; another=xyz`,
  });
  const result = requireAdmin(req);
  assert.equal(result.ok, true);
});

test("an old-style { password } JSON body no longer grants access on its own", async () => {
  // Simule une requête façon ancien système : mot de passe dans le body,
  // aucune session. Doit être refusée malgré la présence d'un "password".
  const req = new Request(URL_ADMIN_ROUTE, {
    method: "POST",
    headers: { origin: "https://jeunes-actifs.example", "content-type": "application/json" },
    body: JSON.stringify({ password: "whatever-it-might-have-been" }),
  });
  const result = requireAdmin(req);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 401);
});
