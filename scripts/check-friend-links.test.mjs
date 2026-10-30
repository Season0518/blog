import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = path =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("About uses a single MDX content entry", () => {
  assert(
    existsSync(new URL("../src/content/pages/about.mdx", import.meta.url))
  );
  assert(
    !existsSync(new URL("../src/content/pages/about.md", import.meta.url))
  );
});

test("About renders the friend link with safe new-tab behavior", () => {
  const html = read("dist/about/index.html");
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
  const list = html.match(
    /<ul\b[^>]*aria-label="友链"[^>]*>([\s\S]*?)<\/ul>/
  )?.[1];
  assert(list, "Friend links must render as a labeled list");
  const links = [...list.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
  assert(links.length > 0, "At least one friend link must render");
  const [, attributes, content] = links[0];
  assert.match(attributes, /href="https:\/\/rei\.ac\/"/);
  assert.match(attributes, /target="_blank"/);
  const rel = attributes.match(/rel="([^"]*)"/)?.[1].split(/\s+/) ?? [];
  for (const token of ["friend", "noopener", "noreferrer"]) {
    assert(rel.includes(token), `Missing link relationship: ${token}`);
  }
  assert.match(content, /rei\.ac/);
  assert.match(content, /在新标签页打开/);
});
