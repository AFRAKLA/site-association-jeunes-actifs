import test from "node:test";
import assert from "node:assert/strict";
import { localizeField } from "../lib/i18n-content.ts";

const row = {
  titre: "Titre français",
  titre_en: "English title",
  titre_ar: "عنوان عربي",
};

test("fr locale always returns the canonical French field", () => {
  assert.equal(localizeField(row, "titre", "fr"), "Titre français");
});

test("en locale uses the _en field when present", () => {
  assert.equal(localizeField(row, "titre", "en"), "English title");
});

test("en locale falls back to French when _en is missing", () => {
  const partial = { titre: "Titre français" };
  assert.equal(localizeField(partial, "titre", "en"), "Titre français");
});

test("en locale falls back to French when _en is null", () => {
  const partial = { titre: "Titre français", titre_en: null };
  assert.equal(localizeField(partial, "titre", "en"), "Titre français");
});

test("en locale falls back to French when _en is an empty/whitespace string", () => {
  const partial = { titre: "Titre français", titre_en: "   " };
  assert.equal(localizeField(partial, "titre", "en"), "Titre français");
});

test("ar locale uses the _ar field when present", () => {
  assert.equal(localizeField(row, "titre", "ar"), "عنوان عربي");
});

test("ar locale falls back to French when _ar is missing", () => {
  const partial = { titre: "Titre français" };
  assert.equal(localizeField(partial, "titre", "ar"), "Titre français");
});

test("ar locale falls back to French when _ar is null", () => {
  const partial = { titre: "Titre français", titre_ar: null };
  assert.equal(localizeField(partial, "titre", "ar"), "Titre français");
});

test("returns an empty string rather than throwing when the French field itself is missing", () => {
  assert.equal(localizeField({}, "titre", "fr"), "");
  assert.equal(localizeField({}, "titre", "en"), "");
});

test("works across different field names on the same row independently", () => {
  const article = {
    titre: "Titre",
    titre_en: "Title",
    extrait: "Extrait",
    // extrait_en intentionally absent
  };
  assert.equal(localizeField(article, "titre", "en"), "Title");
  assert.equal(localizeField(article, "extrait", "en"), "Extrait");
});
