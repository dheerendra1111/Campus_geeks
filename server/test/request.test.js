import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Item from '../src/models/Item.js';
import BorrowRequest from '../src/models/BorrowRequest.js';

const TEST_MONGO_URI = 'mongodb://127.0.0.1:27017/campusgeeks_test_request';

test('Borrow Request Engine & State Machine Suite', async (t) => {
  await mongoose.connect(TEST_MONGO_URI);
  await BorrowRequest.deleteMany({});
  await Item.deleteMany({});
  await User.deleteMany({ email: { $regex: /@requesttest\.edu$/i } });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  // 1. Create Lender (Kavya)
  const lenderRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Kavya Nair',
      email: 'kavya@requesttest.edu',
      password: 'password123',
      collegeId: '2023-CS-112',
      department: 'Computer Science',
      phone: '+919988776655',
    }),
  });
  const lenderToken = (await lenderRes.json()).data.token;

  // 2. Create Borrower (Aditya)
  const borrowerRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Aditya Sen',
      email: 'aditya@requesttest.edu',
      password: 'password123',
      collegeId: '2024-ME-056',
      department: 'Mechanical Engineering',
      phone: '+919988776644',
    }),
  });
  const borrowerToken = (await borrowerRes.json()).data.token;

  // 3. Create a listing owned by Kavya
  const itemRes = await fetch(`${baseUrl}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${lenderToken}`,
    },
    body: JSON.stringify({
      title: 'Engineering Mini Drafter',
      description: 'Standard mini drafter with steel rod and compass clamp',
      category: 'Drafting & Tools',
      condition: 'Good',
      pricingType: 'RENT_PER_DAY',
      pricePerDay: 15,
      depositAmount: 150,
      pickupLocation: 'Mechanical Workshop 2',
    }),
  });
  const itemId = (await itemRes.json()).data._id;

  let requestId = '';

  await t.test('1. POST /api/requests - rejects self-borrowing with 400', async () => {
    const res = await fetch(`${baseUrl}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${lenderToken}`, // Kavya trying to borrow her own drafter
      },
      body: JSON.stringify({
        itemId,
        startDate: '2026-11-01',
        endDate: '2026-11-05',
      }),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /cannot borrow equipment that you already own/i);
  });

  await t.test('2. POST /api/requests - rejects invalid date range (endDate <= startDate) with 400', async () => {
    const res = await fetch(`${baseUrl}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${borrowerToken}`,
      },
      body: JSON.stringify({
        itemId,
        startDate: '2026-11-10',
        endDate: '2026-11-05', // Earlier than start
      }),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /return date must be strictly after/i);
  });

  await t.test('3. POST /api/requests - successfully creates PENDING borrow request', async () => {
    const res = await fetch(`${baseUrl}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${borrowerToken}`,
      },
      body: JSON.stringify({
        itemId,
        startDate: '2026-11-01',
        endDate: '2026-11-05', // 4 days duration
        purpose: 'Machine Drawing Lab exam',
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.status, 'PENDING');
    assert.strictEqual(data.data.totalDays, 4);
    assert.strictEqual(data.data.estimatedCost, 60); // 4 * 15 = 60
    assert.strictEqual(data.data.depositAmount, 150);

    requestId = data.data._id;
  });

  await t.test('4. PATCH /api/requests/:id/status - rejects unauthorized status transition (borrower trying to approve)', async () => {
    const res = await fetch(`${baseUrl}/requests/${requestId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${borrowerToken}`,
      },
      body: JSON.stringify({ status: 'APPROVED' }),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /Only the LENDER can change status/i);
  });

  await t.test('5. PATCH /api/requests/:id/status - allows Lender to approve request', async () => {
    const res = await fetch(`${baseUrl}/requests/${requestId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${lenderToken}`,
      },
      body: JSON.stringify({ status: 'APPROVED' }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.status, 'APPROVED');
  });

  await t.test('6. POST /api/requests - rejects overlapping request for already-approved dates with 409 Conflict', async () => {
    // 3rd user attempting to book overlapping dates
    const res = await fetch(`${baseUrl}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${borrowerToken}`,
      },
      body: JSON.stringify({
        itemId,
        startDate: '2026-11-03', // Overlaps with 2026-11-01 to 2026-11-05
        endDate: '2026-11-07',
      }),
    });

    assert.strictEqual(res.status, 409);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /already reserved or active/i);
  });

  await t.test('7. PATCH /api/requests/:id/status - Borrower confirms pickup, marking status ACTIVE', async () => {
    const res = await fetch(`${baseUrl}/requests/${requestId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${borrowerToken}`,
      },
      body: JSON.stringify({ status: 'ACTIVE' }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.status, 'ACTIVE');
    assert.ok(data.data.handoverDate);

    // Verify item is now marked BORROWED
    const itemCheck = await Item.findById(itemId);
    assert.strictEqual(itemCheck.status, 'BORROWED');
  });

  await t.test('8. PATCH /api/requests/:id/status - Lender confirms return, marking status RETURNED', async () => {
    const res = await fetch(`${baseUrl}/requests/${requestId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${lenderToken}`,
      },
      body: JSON.stringify({ status: 'RETURNED' }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.status, 'RETURNED');
    assert.ok(data.data.actualReturnDate);

    // Verify item is now marked AVAILABLE again
    const itemCheck = await Item.findById(itemId);
    assert.strictEqual(itemCheck.status, 'AVAILABLE');
  });

  // Cleanup
  await BorrowRequest.deleteMany({});
  await Item.deleteMany({});
  await User.deleteMany({ email: { $regex: /@requesttest\.edu$/i } });
  await mongoose.disconnect();
  await new Promise((resolve) => server.close(resolve));
});
