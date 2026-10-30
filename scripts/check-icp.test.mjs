import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const target = process.argv[2] ?? "worldwide";
assert(["cn", "worldwide"].includes(target), "Expected cn or worldwide");

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const filingNumber = "\u5409ICP\u59072025034019\u53f7";
const filingUrl = "https://beian.miit.gov.cn/";

test(`${target} build renders ICP filing only for mainland China`, () => {
  const pages = readdirSync(dist, { recursive: true })
    .filter(path => path.endsWith(".html"))
    .filter(path => !path.startsWith(`pagefind${sep}`))
    .map(path => ({ path, html: readFileSync(join(dist, path), "utf8") }))
    .filter(({ html }) => !/http-equiv="refresh"/.test(html));

  assert(pages.length > 0, "Build the site before checking ICP filing");
  for (const { path, html } of pages) {
    const footer = html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/)?.[1];
    assert(footer, `Missing footer in ${path}`);
    if (target === "worldwide") {
      assert(!html.includes(filingNumber), `Unexpected ICP number in ${path}`);
      assert(!html.includes(filingUrl), `Unexpected ICP link in ${path}`);
      continue;
    }

    const links = [...footer.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].filter(
      ([, attributes]) => attributes.includes(`href="${filingUrl}"`)
    );
    assert.equal(links.length, 1, `Expected one ICP link in ${path}`);
    const [, attributes, content] = links[0];
    assert.equal(
      content.trim(),
      filingNumber,
      `Incorrect ICP number in ${path}`
    );
    assert.match(attributes, /target="_blank"/);
    const rel = attributes.match(/rel="([^"]*)"/)?.[1].split(/\s+/) ?? [];
    for (const token of ["noopener", "noreferrer"]) {
      assert(rel.includes(token), `Missing ${token} on ICP link in ${path}`);
    }
  }
});
