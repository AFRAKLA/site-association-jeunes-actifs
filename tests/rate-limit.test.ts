import test from "node:test";
import assert from "node:assert/strict";

process.env.ADMIN_SESSION_SECRET = "test-secret-do-not-use-in-production";

const { hashRateLimitKey, checkRateLimitFailOpen, checkRateLimitFailClosed } = await import(
  "../lib/rate-limit.ts"
);

test("hashRateLimitKey is deterministic for the same type+ip", () => {
  const a = hashRateLimitKey("login", "203.0.113.5");
  const b = hashRateLimitKey("login", "203.0.113.5");
  assert.equal(a, b);
});

test("hashRateLimitKey differs by type", () => {
  const a = hashRateLimitKey("login", "203.0.113.5");
  const b = hashRateLimitKey("contact", "203.0.113.5");
  assert.notEqual(a, b);
});

test("hashRateLimitKey differs by IP", () => {
  const a = hashRateLimitKey("login", "203.0.113.5");
  const b = hashRateLimitKey("login", "198.51.100.9");
  assert.notEqual(a, b);
});

test("hashRateLimitKey never contains the raw IP in its output", () => {
  const key = hashRateLimitKey("login", "203.0.113.5");
  assert.ok(!key.includes("203.0.113.5"));
  assert.match(key, /^[0-9a-f]+$/); // hex digest opaque, pas l'IP en clair
});

test("checkRateLimitFailClosed propagates the underlying error (never swallows it)", async () => {
  const failingCheck = async () => {
    throw new Error("simulated: table rate_limits absente");
  };

  await assert.rejects(
    () => checkRateLimitFailClosed("login", "203.0.113.5", 5, 900, failingCheck),
    /simulated: table rate_limits absente/
  );
});

test("checkRateLimitFailClosed returns the real result when the check succeeds", async () => {
  const okCheck = async () => ({ allowed: true, retryAfterSeconds: 0 });
  const result = await checkRateLimitFailClosed("login", "203.0.113.5", 5, 900, okCheck);
  assert.deepEqual(result, { allowed: true, retryAfterSeconds: 0 });
});

test("checkRateLimitFailOpen allows the request and logs when the underlying check fails", async () => {
  const failingCheck = async () => {
    throw new Error("simulated: table rate_limits absente");
  };

  const originalConsoleError = console.error;
  let loggedSomething = false;
  console.error = (...args: unknown[]) => {
    loggedSomething = true;
    originalConsoleError(...args);
  };

  try {
    const result = await checkRateLimitFailOpen("contact", "203.0.113.5", 5, 600, failingCheck);
    assert.deepEqual(result, { allowed: true, retryAfterSeconds: 0 });
    assert.equal(loggedSomething, true, "l'indisponibilité doit toujours être journalisée, jamais silencieuse");
  } finally {
    console.error = originalConsoleError;
  }
});

test("checkRateLimitFailOpen returns the real (blocking) result when the check succeeds and denies", async () => {
  const blockingCheck = async () => ({ allowed: false, retryAfterSeconds: 42 });
  const result = await checkRateLimitFailOpen("contact", "203.0.113.5", 5, 600, blockingCheck);
  assert.deepEqual(result, { allowed: false, retryAfterSeconds: 42 });
});
