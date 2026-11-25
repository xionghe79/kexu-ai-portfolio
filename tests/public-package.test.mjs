import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from '../scripts/serve.mjs';

test('README explains what the public demo actually does', async () => {
  const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
  assert.match(readme, /合成数据/);
  assert.match(readme, /离线模拟/);
  assert.match(readme, /npm start/);
  assert.match(readme, /不连接真实 AI/);
});

test('local preview serves the app and its JavaScript', async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const page = await fetch(base);
    const script = await fetch(`${base}/src/app.js`);
    const hidden = await fetch(`${base}/README.md`);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /客序 AI/);
    assert.equal(script.status, 200);
    assert.equal(hidden.status, 404);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
