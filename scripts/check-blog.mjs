import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const read = path => readFileSync(path, 'utf8');
const walk = dir =>
  readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
const decode = text =>
  text.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, entity) => {
    if (entity.startsWith('#'))
      return String.fromCodePoint(
        parseInt(entity.slice(entity[1] === 'x' ? 2 : 1), entity[1] === 'x' ? 16 : 10)
      );
    return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[entity];
  });

const posts = walk('src/content/posts').filter(name => /\.mdx?$/.test(name));
assert(posts.length > 0, 'No posts found');
assert(posts.every(name => name.endsWith('.mdx')), 'All migrated posts should use MDX');

for (const path of posts) {
  const name = path.split('/').pop();
  const markdown = read(path);
  const slug = markdown.match(/^slug: (.+)$/m)?.[1];
  assert(slug, `Missing slug: ${name}`);
  const html = read(join('dist', 'posts', slug, 'index.html'));

  const code = [...markdown.matchAll(/^```[^\n]*\n([\s\S]*?)^```/gm)].map(match =>
    match[1].trim()
  );
  const renderedCode = [
    ...html.matchAll(/<pre\b[^>]*class="astro-code[^"<]*"[^>]*><code\b[^>]*>([\s\S]*?)<\/code><\/pre>/g),
  ].map(match => decode(match[1].replace(/<[^>]+>/g, '')).trim());
  assert.deepEqual(renderedCode, code, `Code changed while rendering: ${name}`);

  const samples = [
    ...markdown.matchAll(/<SampleCase number=\{\d+\} input=\{`([^`]+)`\} output=\{`([^`]+)`\} \/>/g),
  ].flatMap(match => [match[1], match[2]]);
  const renderedSamples = [
    ...html.matchAll(/<pre\b[^>]*class="sample-source[^"<]*"[^>]*><code\b[^>]*>([\s\S]*?)<\/code><\/pre>/g),
  ].map(match => decode(match[1]));
  assert.deepEqual(renderedSamples, samples, `Sample whitespace changed: ${name}`);

  // Copy controls are attached at runtime by the post script.
  assert(html.includes('attachCopyButtons'), `Missing copy script: ${name}`);
  assert.equal(
    (html.match(/<h1[\s>]/g) ?? []).length,
    1,
    `Article must have a single page title: ${name}`
  );
  if (markdown.replace(/^```[^\n]*\n[\s\S]*?^```/gm, '').includes('$')) {
    assert(html.includes('class="katex"'), `Math was not rendered: ${name}`);
    assert(!html.includes('katex-error'), `Invalid formula: ${name}`);
  }

  const legacyPath = markdown.match(/^legacyPath: (.+)$/m)?.[1];
  if (legacyPath) {
    const redirect = read(join('dist', legacyPath, 'index.html'));
    assert(
      redirect.includes(`url=/posts/${encodeURIComponent(slug)}/`),
      `Legacy path must redirect to the new URL: ${name}`
    );
    assert(redirect.includes('http-equiv="refresh"'), `Legacy path must refresh: ${name}`);
    assert(
      redirect.includes('name="robots" content="noindex"'),
      `Legacy path must stay out of search: ${name}`
    );
  }
}

for (const output of [
  'index.html',
  '404.html',
  'about/index.html',
  'posts/index.html',
  'archives/index.html',
  'tags/index.html',
  'search/index.html',
  'rss.xml',
  'robots.txt',
  'sitemap-index.xml',
]) {
  assert(existsSync(join('dist', output)), `Missing expected output: ${output}`);
}

const pages = walk('dist')
  .filter(path => path.endsWith('.html'))
  .filter(path => !path.startsWith(join('dist', 'pagefind')));
for (const page of pages) {
  const html = read(page);
  assert(!/<img\b|<picture\b|og:image|twitter:image/i.test(html), `Unexpected image in ${page}`);
  for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = new URL(decode(value), `http://localhost/${page.slice(5)}`);
    if (url.origin !== 'http://localhost') continue;
    let target = join('dist', decodeURIComponent(url.pathname));
    if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
    assert(existsSync(target), `Broken local link in ${page}: ${value}`);
    if (url.hash && target.endsWith('.html')) {
      assert(
        read(target).includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),
        `Broken anchor in ${page}: ${value}`
      );
    }
  }
}
console.log(`Verified ${posts.length} posts, legacy redirects, and local links across ${pages.length} pages.`);
