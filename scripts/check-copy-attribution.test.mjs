import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../src/scripts/copyAttribution.ts", import.meta.url), "utf8");
const escape = text => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function setup() {
  class Element {
    style = {};
    children = [];
    textContent = "";
    editable = false;
    append(child) { this.children.push(child); }
    closest() { return this.editable ? this : null; }
    get innerHTML() {
      return escape(this.textContent) + this.children.map(child => child.innerHTML).join("");
    }
  }
  const inside = {};
  const article = {
    dataset: { copyAttribution: "作者：Season\n来源：https://season.ac/posts/one/\n协议：CC BY-NC-SA 4.0" },
    contains: node => node === inside,
  };
  const range = {
    commonAncestorContainer: inside,
    cloneContents: () => ({ innerHTML: "<strong>Selected text</strong>" }),
  };
  const selection = {
    rangeCount: 1,
    isCollapsed: false,
    toString: () => "Selected text",
    getRangeAt: () => range,
  };
  let listener;
  const state = { article };
  runInNewContext(source, {
    Element,
    window: { getSelection: () => selection },
    document: {
      addEventListener: (type, callback) => { assert.equal(type, "copy"); listener = callback; },
      getElementById: () => state.article,
      createElement: () => new Element(),
    },
  });
  const data = new Map();
  const event = {
    defaultPrevented: false,
    clipboardData: { setData: (type, value) => data.set(type, value) },
    target: new Element(),
    preventDefault() { this.defaultPrevented = true; },
  };
  return { state, article, range, selection, data, event, copy: () => listener(event) };
}

test("selection copy includes source and license in plain text and preserves rich text", () => {
  const { copy, event, data, article } = setup();
  copy();
  assert(event.defaultPrevented);
  assert.equal(data.get("text/plain"), `Selected text\n\n${article.dataset.copyAttribution}`);
  assert(data.get("text/html").startsWith("<strong>Selected text</strong>"));
  assert(data.get("text/html").includes(article.dataset.copyAttribution));
});

test("copy after Astro navigation resolves the new article and escapes attribution in HTML", () => {
  const fixture = setup();
  fixture.state.article = { ...fixture.article, dataset: { copyAttribution: "作者：<new>\n来源：https://season.ac/posts/two/\n协议：CC BY-NC-SA 4.0" } };
  fixture.copy();
  assert(fixture.data.get("text/plain").includes("/posts/two/"));
  assert(fixture.data.get("text/html").includes("&lt;new&gt;"));
});

for (const [name, mutate] of [
  ["outside article", f => { f.range.commonAncestorContainer = {}; }],
  ["non-article page", f => { f.state.article = null; }],
  ["empty selection", f => { f.selection.isCollapsed = true; }],
  ["editable field", f => { f.event.target.editable = true; }],
  ["unavailable clipboard", f => { f.event.clipboardData = null; }],
  ["already handled copy", f => { f.event.defaultPrevented = true; }],
]) {
  test(`leaves default copying intact for ${name}`, () => {
    const fixture = setup();
    mutate(fixture);
    const prevented = fixture.event.defaultPrevented;
    fixture.copy();
    assert.equal(fixture.data.size, 0);
    assert.equal(fixture.event.defaultPrevented, prevented);
  });
}
