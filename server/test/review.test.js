import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Item from '../src/models/Item.js';
import BorrowRequest from '../src/models/BorrowRequest.js';
import Review from '../src/models/Review.js';

const TEST_MONGO_URI = 'mongodb://127.0.0.1:27017/campusgeeks_test_review';

test('Peer Reviews & Trust Score API Suite', async (t) => {
  await mongoose.connect(TEST_MONGO_URI);
  await Review.deleteMany({});
  await BorrowRequest.deleteMany({});
  await Item.deleteMany({});
  await User.deleteMany({ email: { $regex: /@reviewtest\.edu$/i } });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  // 1. Create Lender (Rohan)
  const lenderRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Rohan Joshi',
      email: 'rohan@reviewtest.edu',
      password: 'password123',
      collegeId: '2023-CS-301',
      department: 'Computer Science',
      phone: '+919876543201',
    }),
  });
  const lenderData = (await lenderRes.json()).data;
  const lenderToken = lenderData.token;
  const lenderId = lenderData._id;

  // 2. Create Borrower (Meera)
  const borrowerRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Meera Patel',
      email: 'meera@reviewtest.edu',
      password: 'password123',
      collegeId: '2024-EC-202',
      department: 'Electronics',
      phone: '+919876543202',
    }),
  });
  const borrowerToken = (await borrowerRes.json()).data.token;

  // 3. Create Item
  const itemRes = await fetch(`${baseUrl}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${lenderToken}`,
    },
    body: JSON.stringify({
      title: 'Digital Multimeter & Probe Set',
      description: 'Handheld digital multimeter for circuit lab experiments',
      category: 'Electronics & Kits',
      condition: 'Like New',
    }),
  });
  const itemId = (await itemRes.json()).data._id;

  // 4. Create Borrow Request
  const reqRes = await fetch(`${baseUrl}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${borrowerToken}`,
    },
    body: JSON.stringify({
      itemId,
      startDate: '2026-11-01',
      endDate: '2026-11-03',
      purpose: 'Analog Circuits lab',
    }),
  });
  const requestId = (await reqRes.json()).data._id;

  await t.test('1. POST /api/reviews - rejects review if transaction status is not RETURNED with 400', async () => {
    const res = await fetch(`${baseUrl}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${borrowerToken}`,
      },
      body: JSON.stringify({
        requestId,
        rating: 5,
        comment: 'Great multimeter, works perfectly!',
      }),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /after the item has been returned/i);
  });

  // Advance lifecycle to RETURNED: Approve -> Active -> Returned
  await fetch(`${baseUrl}/requests/${requestId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${lenderToken}` },
    body: JSON.stringify({ status: 'APPROVED' }),
  });
  await fetch(`${baseUrl}/requests/${requestId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${borrowerToken}` },
    body: JSON.stringify({ status: 'ACTIVE' }),
  });
  await fetch(`${baseUrl}/requests/${requestId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${lenderToken}` },
    body: JSON.stringify({ status: 'RETURNED' }),
  });

  await t.test('2. POST /api/reviews - successfully submits review and recalculates trustScore', async () => {
    const res = await fetch(`${baseUrl}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${borrowerToken}`, // Meera rating Rohan
      },
      body: JSON.stringify({
        requestId,
        rating: 5,
        comment: 'Rohan was super helpful, multimeter came with fresh batteries!',
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.rating, 5);

    // Verify Rohan's user profile updated
    const lenderCheck = await User.findById(lenderId);
    assert.strictEqual(lenderCheck.trustScore, 5.0);
    assert.strictEqual(lenderCheck.totalReviews, 1);
  });

  await t.test('3. POST /api/reviews - prevents duplicate review for the same request with 400', async () => {
    const res = await fetch(`${baseUrl}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${borrowerToken}`,
      },
      body: JSON.stringify({
        requestId,
        rating: 4,
        comment: 'Duplicate review attempt',
      }),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /already submitted a review/i);
  });

  await t.test('4. GET /api/reviews/user/:userId - fetches public reviews for a student', async () => {
    const res = await fetch(`${baseUrl}/reviews/user/${lenderId}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.count, 1);
    assert.strictEqual(data.data[0].rating, 5);
    assert.strictEqual(data.data[0].reviewer.name, 'Meera Patel');
  });

  // Cleanup
  await Review.deleteMany({});
  await BorrowRequest.deleteMany({});
  await Item.deleteMany({});
  await User.deleteMany({ email: { $regex: /@reviewtest\.edu$/i } });
  await mongoose.disconnect();
  await new Promise((resolve) => server.close(resolve));
});
