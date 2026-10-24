import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Item from '../src/models/Item.js';

const TEST_MONGO_URI = 'mongodb://127.0.0.1:27017/campusgeeks_test_item';

test('Item Listings & Catalog API Suite', async (t) => {
  await mongoose.connect(TEST_MONGO_URI);
  await Item.deleteMany({});
  await User.deleteMany({ email: { $regex: /@itemtest\.edu$/i } });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  // 1. Create a primary student user (Lender)
  const lenderRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Ananya Iyer',
      email: 'ananya@itemtest.edu',
      password: 'password123',
      collegeId: '2023-EE-045',
      department: 'Electrical Engineering',
      phone: '+919876500001',
    }),
  });
  const lenderData = await lenderRes.json();
  const lenderToken = lenderData.data.token;

  // 2. Create a secondary student user (Unauthorized Peer)
  const peerRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Vikas Sharma',
      email: 'vikas@itemtest.edu',
      password: 'password123',
      collegeId: '2023-ME-019',
      department: 'Mechanical Engineering',
      phone: '+919876500002',
    }),
  });
  const peerData = await peerRes.json();
  const peerToken = peerData.data.token;

  let createdItemId = '';

  await t.test('1. POST /api/items - rejects unauthenticated creation with 401', async () => {
    const res = await fetch(`${baseUrl}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Arduino Uno Starter Kit',
        description: 'Complete kit with sensors and breadboard',
        category: 'Electronics & Kits',
      }),
    });

    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  await t.test('2. POST /api/items - successfully creates item with authenticated token', async () => {
    const res = await fetch(`${baseUrl}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${lenderToken}`,
      },
      body: JSON.stringify({
        title: 'Arduino Uno Starter Kit',
        description: 'Complete kit with sensors, jumper wires, and breadboard',
        category: 'Electronics & Kits',
        condition: 'Like New',
        pricingType: 'RENT_PER_DAY',
        pricePerDay: 25,
        depositAmount: 300,
        pickupLocation: 'Hostel 3 Common Room',
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.title, 'Arduino Uno Starter Kit');
    assert.strictEqual(data.data.pricePerDay, 25);
    assert.strictEqual(data.data.status, 'AVAILABLE');
    assert.ok(data.data.images.length > 0);

    createdItemId = data.data._id;
  });

  await t.test('3. GET /api/items - retrieves catalog with pagination', async () => {
    const res = await fetch(`${baseUrl}/items?page=1&limit=10`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.length >= 1);
    assert.ok(data.total >= 1);
    assert.ok(data.data[0].owner.name); // populated owner
  });

  await t.test('4. GET /api/items?category=... - filters by category', async () => {
    const resMatch = await fetch(
      `${baseUrl}/items?category=${encodeURIComponent('Electronics & Kits')}`
    );
    const matchData = await resMatch.json();
    assert.strictEqual(matchData.count >= 1, true);

    const resNoMatch = await fetch(
      `${baseUrl}/items?category=${encodeURIComponent('Lab Gear')}`
    );
    const noMatchData = await resNoMatch.json();
    assert.strictEqual(noMatchData.count, 0);
  });

  await t.test('5. GET /api/items/:id - retrieves single item with owner details', async () => {
    const res = await fetch(`${baseUrl}/items/${createdItemId}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data._id, createdItemId);
    assert.strictEqual(data.data.owner.email, 'ananya@itemtest.edu');
    assert.strictEqual(data.data.owner.department, 'Electrical Engineering');
  });

  await t.test('6. PUT /api/items/:id - rejects non-owner update with 403', async () => {
    const res = await fetch(`${baseUrl}/items/${createdItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${peerToken}`, // Vikas trying to edit Ananya's item
      },
      body: JSON.stringify({ title: 'Hacked Title' }),
    });

    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /only update items you listed/i);
  });

  await t.test('7. PUT /api/items/:id - allows owner to update item details', async () => {
    const res = await fetch(`${baseUrl}/items/${createdItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${lenderToken}`,
      },
      body: JSON.stringify({ pricePerDay: 30 }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.pricePerDay, 30);
  });

  await t.test('8. DELETE /api/items/:id - rejects non-owner deletion with 403', async () => {
    const res = await fetch(`${baseUrl}/items/${createdItemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${peerToken}` },
    });

    assert.strictEqual(res.status, 403);
  });

  await t.test('9. DELETE /api/items/:id - allows owner to delete listing', async () => {
    const res = await fetch(`${baseUrl}/items/${createdItemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${lenderToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);

    // Verify it is gone
    const verifyRes = await fetch(`${baseUrl}/items/${createdItemId}`);
    assert.strictEqual(verifyRes.status, 404);
  });

  // Cleanup
  await Item.deleteMany({});
  await User.deleteMany({ email: { $regex: /@itemtest\.edu$/i } });
  await mongoose.disconnect();
  await new Promise((resolve) => server.close(resolve));
});
