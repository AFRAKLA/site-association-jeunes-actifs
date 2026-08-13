import test from "node:test";
import assert from "node:assert/strict";
import { evaluateGuard, hostnameOf } from "../scripts/guard-against-production.mjs";

test("refuses when no active SUPABASE_URL is configured", () => {
  const result = evaluateGuard({ activeUrl: undefined, productionUrl: "https://prod.supabase.co" });
  assert.equal(result.allowed, false);
  assert.match(result.reason, /Aucun SUPABASE_URL actif/);
});

test("refuses when the production reference cannot be determined (fail-closed, not fail-open)", () => {
  const result = evaluateGuard({ activeUrl: "https://some-test-project.supabase.co", productionUrl: null });
  assert.equal(result.allowed, false);
  assert.match(result.reason, /Impossible de déterminer l'hôte Supabase de production/);
});

test("refuses when the production reference is present but unparsable as a URL", () => {
  const result = evaluateGuard({ activeUrl: "https://some-test-project.supabase.co", productionUrl: "not-a-valid-url" });
  assert.equal(result.allowed, false);
  assert.match(result.reason, /Impossible de déterminer l'hôte Supabase de production/);
});

test("refuses when the active environment IS production", () => {
  const result = evaluateGuard({
    activeUrl: "https://prod.supabase.co",
    productionUrl: "https://prod.supabase.co",
  });
  assert.equal(result.allowed, false);
  assert.match(result.reason, /DANGER/);
});

test("refuses when active and production resolve to the same host via different URL forms", () => {
  const result = evaluateGuard({
    activeUrl: "https://prod.supabase.co/",
    productionUrl: "https://prod.supabase.co",
  });
  assert.equal(result.allowed, false);
});

test("allows when the active environment is explicitly different and verifiable", () => {
  const result = evaluateGuard({
    activeUrl: "https://test-project-xyz.supabase.co",
    productionUrl: "https://prod.supabase.co",
  });
  assert.equal(result.allowed, true);
  assert.match(result.reason, /distinct de la production confirmé/);
});

test("hostnameOf returns null for missing or invalid URLs without throwing", () => {
  assert.equal(hostnameOf(null), null);
  assert.equal(hostnameOf(undefined), null);
  assert.doesNotThrow(() => hostnameOf("not-a-url"));
  assert.equal(hostnameOf("not-a-url"), null);
});

test("hostnameOf extracts the hostname from a valid URL", () => {
  assert.equal(hostnameOf("https://abcdef.supabase.co/rest/v1"), "abcdef.supabase.co");
});
