import test from "node:test";
import assert from "node:assert/strict";
import { constantTimeEqual } from "../lib/constant-time-equal.ts";

test("returns true for identical strings", () => {
  assert.equal(constantTimeEqual("secret-value", "secret-value"), true);
});

test("returns false for different strings of the same length", () => {
  assert.equal(constantTimeEqual("secret-value", "secret-valuf"), false);
});

test("returns false for different strings of different lengths without throwing", () => {
  assert.doesNotThrow(() => constantTimeEqual("short", "a-much-longer-string-here"));
  assert.equal(constantTimeEqual("short", "a-much-longer-string-here"), false);
});

test("returns false comparing against an empty string", () => {
  assert.equal(constantTimeEqual("something", ""), false);
});

test("returns true comparing two empty strings", () => {
  assert.equal(constantTimeEqual("", ""), true);
});
