import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import app from '../src/app.js';

test('Server Health Check & Routing Smoke Test', async (t) => {
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  await t.test('GET / should return API info', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.match(data.message, /CampusGeeks/i);
  });

  await t.test('GET /api/health should return healthy status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.status, 'healthy');
    assert.ok(data.timestamp);
  });

  await t.test('GET /random-unknown-route should return 404', async () => {
    const res = await fetch(`${baseUrl}/random-unknown-route`);
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /Route not found/i);
  });

  await new Promise((resolve) => server.close(resolve));
});
