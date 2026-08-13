import test from "node:test";
import assert from "node:assert/strict";

process.env.ADMIN_SESSION_SECRET = "test-secret-do-not-use-in-production";

const { createSessionToken, verifySessionToken, SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } =
  await import("../lib/admin-session.ts");

test("a freshly created token verifies as valid", () => {
  const token = createSessionToken();
  assert.equal(verifySessionToken(token), true);
});

test("session duration is capped at 8 hours", () => {
  assert.equal(SESSION_DURATION_SECONDS, 8 * 60 * 60);
});

test("cookie name is stable", () => {
  assert.equal(SESSION_COOKIE_NAME, "admin_session");
});

test("rejects null/undefined/empty token without throwing", () => {
  assert.equal(verifySessionToken(null), false);
  assert.equal(verifySessionToken(undefined), false);
  assert.equal(verifySessionToken(""), false);
});

test("rejects a garbage string without throwing", () => {
  assert.doesNotThrow(() => verifySessionToken("not-a-token-at-all"));
  assert.equal(verifySessionToken("not-a-token-at-all"), false);
});

test("rejects a token with the wrong number of segments", () => {
  assert.equal(verifySessionToken("a.b.c"), false);
  assert.equal(verifySessionToken("a"), false);
  assert.equal(verifySessionToken("."), false);
});

test("rejects a token whose signature was tampered with", () => {
  const token = createSessionToken();
  const [payloadB64] = token.split(".");
  const tampered = `${payloadB64}.completely-wrong-signature`;
  assert.equal(verifySessionToken(tampered), false);
});

test("rejects a token whose payload was tampered with (signature no longer matches)", () => {
  const token = createSessionToken();
  const [, signature] = token.split(".");
  const forgedPayload = Buffer.from(JSON.stringify({ admin: true, iat: 0, exp: 9999999999 }), "utf8").toString(
    "base64url"
  );
  const tampered = `${forgedPayload}.${signature}`;
  assert.equal(verifySessionToken(tampered), false);
});

test("rejects an expired token even with a valid signature", async () => {
  // On fabrique nous-mêmes un token expiré en importurbant la même logique de signature
  // via un secret partagé, pour prouver que l'expiration est bien vérifiée après la
  // signature (et pas seulement au moment de la création, que le code ne permet pas
  // de forcer directement).
  const { createHmac } = await import("crypto");
  const secret = process.env.ADMIN_SESSION_SECRET!;
  const now = Math.floor(Date.now() / 1000);
  const payload = { admin: true, iat: now - 100, exp: now - 10 }; // expiré il y a 10s
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = createHmac("sha256", secret).update(payloadB64).digest("base64url");
  const expiredToken = `${payloadB64}.${signature}`;

  assert.equal(verifySessionToken(expiredToken), false);
});

test("rejects a well-signed payload where admin is not strictly true", async () => {
  const { createHmac } = await import("crypto");
  const secret = process.env.ADMIN_SESSION_SECRET!;
  const now = Math.floor(Date.now() / 1000);
  const payload = { admin: "true", iat: now, exp: now + 1000 }; // string, pas booléen
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = createHmac("sha256", secret).update(payloadB64).digest("base64url");
  const token = `${payloadB64}.${signature}`;

  assert.equal(verifySessionToken(token), false);
});

test("rejects a well-signed but non-JSON payload without throwing", async () => {
  const { createHmac } = await import("crypto");
  const secret = process.env.ADMIN_SESSION_SECRET!;
  const payloadB64 = Buffer.from("this is not json", "utf8").toString("base64url");
  const signature = createHmac("sha256", secret).update(payloadB64).digest("base64url");
  const token = `${payloadB64}.${signature}`;

  assert.doesNotThrow(() => verifySessionToken(token));
  assert.equal(verifySessionToken(token), false);
});

test("verification fails closed (returns false, never throws) when the secret is missing", async () => {
  const original = process.env.ADMIN_SESSION_SECRET;
  const token = createSessionToken();
  delete process.env.ADMIN_SESSION_SECRET;
  try {
    assert.doesNotThrow(() => verifySessionToken(token));
    assert.equal(verifySessionToken(token), false);
  } finally {
    process.env.ADMIN_SESSION_SECRET = original;
  }
});

test("createSessionToken throws clearly if the secret is missing (fail loud at creation time)", async () => {
  const original = process.env.ADMIN_SESSION_SECRET;
  delete process.env.ADMIN_SESSION_SECRET;
  try {
    assert.throws(() => createSessionToken());
  } finally {
    process.env.ADMIN_SESSION_SECRET = original;
  }
});
