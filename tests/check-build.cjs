const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const page = JSON.parse(fs.readFileSync('.next/server/pages/index.json', 'utf8'));
assert.deepEqual(page.pageProps.repos, []);
const html = fs.readFileSync('.next/server/pages/index.html', 'utf8');
const nextData = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
assert.ok(nextData, 'The generated HTML must contain Next.js page data');
assert.deepEqual(JSON.parse(nextData[1]).props.pageProps.repos, []);

const inspectClientFiles = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) inspectClientFiles(file);
    else if (file.endsWith('.js')) {
      assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /PublicPortfolioRepositories|api\.github\.com\/graphql|Unable to load public GitHub repositories/,
        'The server-only repository fetcher must not be included in browser JavaScript');
    }
  }
};
inspectClientFiles('.next/static');
console.log('PASS: credential-free HTML/JSON have no repository records; server-only GitHub fetcher absent from client JavaScript.');
