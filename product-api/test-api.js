const assert = require("node:assert/strict");

const baseUrl = "http://localhost:3000";

async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, options);
    const body = await response.json();
    return { response, body };
}

async function runTests() {
    let result = await request("/products");
    assert.equal(result.response.status, 200);
    assert.equal(result.body.length, 100);

    result = await request("/products/1");
    assert.equal(result.response.status, 200);
    assert.equal(result.body.id, 1);

    result = await request("/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test Product", price: 25.5, category: "Test", stock: 10 })
    });
    assert.equal(result.response.status, 201);
    const createdId = result.body.product.id;

    result = await request(`/products/${createdId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Replaced Product", price: 30, category: "Updated", stock: 12 })
    });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.product.name, "Replaced Product");

    result = await request(`/products/${createdId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: 35 })
    });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.product.price, 35);
    assert.equal(result.body.product.stock, 12);

    result = await request(`/products/${createdId}`, { method: "DELETE" });
    assert.equal(result.response.status, 200);

    result = await request(`/products/${createdId}`);
    assert.equal(result.response.status, 404);

    result = await request("/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Incomplete Product" })
    });
    assert.equal(result.response.status, 400);

    console.log("All GET, POST, PUT, PATCH, and DELETE API tests passed.");
}

runTests().catch(error => {
    console.error("API test failed:", error.message);
    process.exitCode = 1;
});