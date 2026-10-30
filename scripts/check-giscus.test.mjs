import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const target = process.argv[2] ?? "worldwide";
assert(["cn", "worldwide"].includes(target), "Expected cn or worldwide");
const enabled = target !== "cn" && process.env.PUBLIC_GISCUS_ENABLED === "true";
const files = readdirSync("dist", { recursive: true });
const read = path => readFileSync(join("dist", path), "utf8");

test(`${target} exposes comments only on overseas article pages`, () => {
  const terms = new Set();
  let articles = 0;
  for (const path of files.filter(path => path.endsWith(".html"))) {
    const html = read(path);
    const article = html.includes('"@type":"BlogPosting"');
    if (article) articles++;
    if (!enabled || !article) {
      assert(!html.includes("giscus"), `Unexpected Giscus markup in ${path}`);
      if (target === "worldwide" && article) {
        assert(html.includes("评论暂未开放"), `Missing inactive state in ${path}`);
      }
      continue;
    }

    const widgets = [...html.matchAll(/<giscus-widget\b([^>]*)>/g)];
    assert.equal(widgets.length, 1, `Expected one comments widget in ${path}`);
    const attributes = widgets[0][1];
    for (const expected of [
      'repo="Season0518/blog"',
      'repoid="R_kgDOVZ_yXQ"',
      'categoryid="DIC_kwDOVZ_yXc4DJ_tc"',
      'mapping="specific"',
      'strict="1"',
      'loading="lazy"',
    ]) {
      assert(attributes.includes(expected), `Missing ${expected} in ${path}`);
    }
    const term = attributes.match(/\bterm="([^"]+)"/)?.[1];
    assert(term, `Missing discussion mapping in ${path}`);
    assert.equal(
      decodeURI(term).replace(/\/$/, ""),
      `/${path.replace(/\/index\.html$/, "")}`,
      `Comments mapped to another article in ${path}`
    );
    assert(!terms.has(term), `Shared comment thread for ${path}`);
    terms.add(term);
    const backlink = html.match(/name="giscus:backlink" content="([^"]+)"/)?.[1];
    assert(backlink, `Missing canonical comment backlink in ${path}`);
    assert.equal(new URL(backlink).origin, "https://season.ac");
    assert.equal(decodeURI(new URL(backlink).pathname), decodeURI(term));
    assert.match(html, /id="comments"[^>]*data-pagefind-ignore/);
  }
  assert(articles > 0, "Expected built article pages");
  if (enabled) assert.equal(terms.size, articles);
});

test(`${target} ${enabled ? "includes" : "excludes"} the Giscus runtime`, () => {
  const runtime = files.filter(path => path.endsWith(".js")).map(read).join("\n");
  assert.equal(runtime.includes("https://giscus.app"), enabled);
});
