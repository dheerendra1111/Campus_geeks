import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';

const TEST_MONGO_URI = 'mongodb://127.0.0.1:27017/campusgeeks_test';

test('Authentication API Endpoints Suite', async (t) => {
  // 1. Connect to test DB
  await mongoose.connect(TEST_MONGO_URI);
  await User.deleteMany({ email: { $regex: /@testcollege\.edu$/i } });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/auth`;

  let authCookie = '';
  let authToken = '';

  const sampleStudent = {
    name: 'Rahul Verma',
    email: 'rahul.verma@testcollege.edu',
    password: 'password123',
    collegeId: '2023-CS-088',
    department: 'Computer Science',
    phone: '+919876543210',
  };

  await t.test('1. POST /register - successfully registers a student and sets JWT cookie', async () => {
    const res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sampleStudent),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.name, sampleStudent.name);
    assert.strictEqual(data.data.email, sampleStudent.email);
    assert.strictEqual(data.data.collegeId, sampleStudent.collegeId);
    assert.strictEqual(data.data.password, undefined); // Ensure password is never exposed
    assert.ok(data.data.token);

    authToken = data.data.token;
    // Capture the set-cookie header
    const rawCookie = res.headers.get('set-cookie');
    if (rawCookie) {
      authCookie = rawCookie.split(';')[0];
    }
  });

  await t.test('2. POST /register - rejects duplicate email with 400', async () => {
    const res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sampleStudent),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /already exists/i);
  });

  await t.test('3. POST /register - rejects missing required fields with 400', async () => {
    const res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Incomplete User' }),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  await t.test('4. POST /login - successfully logs in with valid credentials', async () => {
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: sampleStudent.email,
        password: sampleStudent.password,
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.token);
  });

  await t.test('5. POST /login - rejects invalid password with 401', async () => {
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: sampleStudent.email,
        password: 'wrong_password_xyz',
      }),
    });

    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /invalid email or password/i);
  });

  await t.test('6. GET /me - returns 401 when unauthenticated', async () => {
    const res = await fetch(`${baseUrl}/me`);
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  await t.test('7. GET /me - returns profile when authenticated via Bearer token', async () => {
    const res = await fetch(`${baseUrl}/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.email, sampleStudent.email);
  });

  await t.test('8. POST /logout - clears the auth cookie', async () => {
    const res = await fetch(`${baseUrl}/logout`, { method: 'POST' });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie && setCookie.includes('jwt=;'));
  });

  // Cleanup
  await User.deleteMany({ email: { $regex: /@testcollege\.edu$/i } });
  await mongoose.disconnect();
  await new Promise((resolve) => server.close(resolve));
});
