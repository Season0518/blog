import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const target = process.argv[2] ?? "worldwide";
const measurementIds = {
  cn: "G-GVFE3FCTJS",
  worldwide: "G-4R1BNLBKV2",
};
assert(Object.hasOwn(measurementIds, target), "Expected cn or worldwide");
const measurementId = measurementIds[target];
const tagUrl = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
const scripts = html => [
  ...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g),
];
const initialization = html => {
  const matches = scripts(html).filter(([, , source]) =>
    source.includes("window.__ga4Initialized")
  );
  assert.equal(matches.length, 1, "Expected one GA4 initialization script");
  return matches[0][2];
};
const home = () => readFileSync(join(dist, "index.html"), "utf8");

test(`${target} pages load only their own GA4 tag once in the head`, () => {
  const pages = readdirSync(dist, { recursive: true })
    .filter(path => path.endsWith(".html"))
    .filter(path => !path.startsWith(`pagefind${sep}`))
    .map(path => ({ path, html: readFileSync(join(dist, path), "utf8") }))
    .filter(({ html }) => !/http-equiv="refresh"/.test(html));

  assert(pages.length > 0, "Build the site before checking Google Analytics");
  for (const { path, html } of pages) {
    const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/)?.[1];
    assert(head, `Missing head in ${path}`);
    const tags = scripts(head).filter(([, attributes]) =>
      attributes.includes(`src="${tagUrl}"`)
    );
    assert.equal(tags.length, 1, `Expected one GA4 loader in ${path}`);
    assert.match(tags[0][1], /\basync(?:[\s=]|$)/);
    initialization(head);
    for (const [mode, id] of Object.entries(measurementIds)) {
      if (mode !== target) {
        assert(!html.includes(id), `Unexpected ${mode} GA4 ID in ${path}`);
      }
    }
  }
});

test("GA4 initializes once even if Astro executes the script again", () => {
  const window = {};
  const source = initialization(home());
  const execute = () => runInNewContext(source, { window, Date });

  execute();
  assert.equal(typeof window.gtag, "function");
  assert.equal(window.dataLayer.length, 2);
  assert.equal(window.dataLayer[0][0], "js");
  assert(window.dataLayer[0][1] instanceof Date);
  assert.deepEqual(Array.from(window.dataLayer[1]), ["config", measurementId]);

  const originalGtag = window.gtag;
  execute();
  execute();
  assert.equal(window.gtag, originalGtag);
  assert.equal(window.dataLayer.length, 2, "Do not queue duplicate page views");
});

test("GA4 preserves an existing data layer", () => {
  const existingEvent = { event: "existing-event" };
  const dataLayer = [existingEvent];
  const window = { dataLayer };

  runInNewContext(initialization(home()), { window, Date });
  assert.equal(window.dataLayer, dataLayer);
  assert.equal(dataLayer[0], existingEvent);
  assert.equal(dataLayer.length, 3);
});
