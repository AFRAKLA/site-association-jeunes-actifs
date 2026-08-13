import test from "node:test";
import assert from "node:assert/strict";
import { escapeHtml } from "../lib/html-escape.ts";

test("escapes the five HTML-significant characters", () => {
  assert.equal(escapeHtml("&"), "&amp;");
  assert.equal(escapeHtml("<"), "&lt;");
  assert.equal(escapeHtml(">"), "&gt;");
  assert.equal(escapeHtml('"'), "&quot;");
  assert.equal(escapeHtml("'"), "&#39;");
});

test("neutralises a script tag injection attempt", () => {
  const input = "Alice <script>alert(1)</script> & Bob";
  const output = escapeHtml(input);
  assert.ok(!output.includes("<script>"));
  assert.equal(
    output,
    "Alice &lt;script&gt;alert(1)&lt;/script&gt; &amp; Bob"
  );
});

test("leaves plain text untouched", () => {
  assert.equal(escapeHtml("Bonjour, ceci est un message normal."), "Bonjour, ceci est un message normal.");
});

test("handles empty string", () => {
  assert.equal(escapeHtml(""), "");
});
