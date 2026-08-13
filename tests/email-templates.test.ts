import test from "node:test";
import assert from "node:assert/strict";
import { buildContactReplyHtml, buildAdhesionReplyHtml } from "../lib/email-templates.ts";

test("buildContactReplyHtml escapes a hostile nom coming from the public form", () => {
  const html = buildContactReplyHtml({
    nom: "Alice <script>alert(1)</script> & Bob",
    sujet: "Sujet normal",
    corps: "Réponse normale de l'admin.",
  });
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("Alice &lt;script&gt;alert(1)&lt;/script&gt; &amp; Bob"));
});

test("buildContactReplyHtml escapes a hostile sujet", () => {
  const html = buildContactReplyHtml({
    nom: "Alice",
    sujet: '"><img src=x onerror=alert(1)>',
    corps: "Réponse normale.",
  });
  assert.ok(!html.includes("<img src=x onerror=alert(1)>"));
});

test("buildContactReplyHtml preserves the application's own literal HTML skeleton", () => {
  const html = buildContactReplyHtml({ nom: "Alice", sujet: "Sujet", corps: "Corps" });
  assert.ok(html.includes('<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">'));
  assert.ok(html.includes("<hr"));
});

test("buildAdhesionReplyHtml escapes a hostile nom", () => {
  const html = buildAdhesionReplyHtml({
    nom: "<script>document.location='https://evil.example'</script>",
    corps: "Bienvenue.",
  });
  assert.ok(!html.includes("<script>"));
});
