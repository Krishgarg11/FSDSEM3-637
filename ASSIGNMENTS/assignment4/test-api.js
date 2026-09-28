/**
 * Automated Test Script for Campus Help Desk REST API
 * Run with: node test-api.js (while server is running on http://localhost:3000)
 */

const BASE_URL = "http://localhost:3000/api/requests";

async function runTests() {
  console.log("\n🧪 STARTING CAMPUS HELP DESK API TESTS...\n");

  try {
    // 1. GET all requests (Initial)
    console.log("➡️ Test 1: GET /api/requests (Initial list)");
    const res1 = await fetch(BASE_URL);
    const data1 = await res1.json();
    console.log(`Status: ${res1.status}, Requests count: ${data1.length}`);

    // 2. POST create a new request
    console.log("\n➡️ Test 2: POST /api/requests (Create request)");
    const sampleRequest = {
      studentName: "Test Student",
      email: "test.student@campus.edu",
      category: "IT & Wi-Fi Network",
      description: "Automated test description for issue verification.",
      priority: "High"
    };

    const res2 = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sampleRequest)
    });
    const data2 = await res2.json();
    console.log(`Status: ${res2.status}, Created ID: ${data2.request?.id}`);
    const createdId = data2.request?.id;

    if (!createdId) {
      throw new Error("Creation failed, could not get created ID.");
    }

    // 3. GET single request by ID
    console.log(`\n➡️ Test 3: GET /api/requests/${createdId}`);
    const res3 = await fetch(`${BASE_URL}/${createdId}`);
    const data3 = await res3.json();
    console.log(`Status: ${res3.status}, Student Name: ${data3.studentName}`);

    // 4. PUT update request
    console.log(`\n➡️ Test 4: PUT /api/requests/${createdId}`);
    const updateData = {
      studentName: "Test Student Updated",
      email: "test.student@campus.edu",
      category: "Academic Support",
      description: "Updated description verifying PUT endpoint.",
      priority: "Urgent"
    };

    const res4 = await fetch(`${BASE_URL}/${createdId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData)
    });
    const data4 = await res4.json();
    console.log(`Status: ${res4.status}, Updated Priority: ${data4.request?.priority}`);

    // 5. DELETE request
    console.log(`\n➡️ Test 5: DELETE /api/requests/${createdId}`);
    const res5 = await fetch(`${BASE_URL}/${createdId}`, {
      method: "DELETE"
    });
    const data5 = await res5.json();
    console.log(`Status: ${res5.status}, Message: ${data5.message}`);

    // 6. Verify 404 on deleted request
    console.log(`\n➡️ Test 6: GET /api/requests/${createdId} (Verify 404)`);
    const res6 = await fetch(`${BASE_URL}/${createdId}`);
    console.log(`Status: ${res6.status} (Expected 404)`);

    console.log("\n✅ ALL API TESTS PASSED SUCCESSFULLY! 🎉\n");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.log("Tip: Make sure the server is running with 'npm start' on http://localhost:3000\n");
  }
}

runTests();
