import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(
  new URL("../src/utils/getSortedPosts.ts", import.meta.url),
  "utf8"
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
});
const exports = {};

// Isolate sorting from Astro's environment-dependent publication filter.
runInNewContext(outputText, {
  exports,
  require: name => {
    assert.equal(name, "./postFilter");
    return { postFilter: () => true };
  },
});
const { getSortedPosts } = exports;
const timestamp = "2026-10-30T12:00:00+08:00";
const post = (title, pubDatetime = timestamp, modDatetime) => ({
  data: { title, pubDatetime, modDatetime },
});
const titles = posts => posts.map(({ data }) => data.title);

test("equal timestamps sort series titles as 00, 01, 02 in any input order", () => {
  const posts = [0, 1, 2].map(index => post(`VibeCoding 0x0${index}`));
  for (const order of [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ]) {
    assert.deepEqual(
      titles(getSortedPosts(order.map(index => posts[index]))),
      titles(posts)
    );
  }
});

test("publication time remains descending regardless of title", () => {
  const older = post("A", "2026-10-29T12:00:00+08:00");
  const newer = post("Z");
  assert.deepEqual(getSortedPosts([older, newer]), [newer, older]);
});

test("modification time takes priority over publication time and title", () => {
  const modified = post("Z", "2026-10-28", "2026-10-31");
  const published = post("A");
  assert.deepEqual(getSortedPosts([published, modified]), [modified, published]);
});

test("sorting leaves the input collection unchanged", () => {
  const posts = [post("VibeCoding 0x02"), post("VibeCoding 0x00")];
  const original = [...posts];
  assert.notDeepEqual(getSortedPosts(posts), original);
  assert.deepEqual(posts, original);
});
