import assert from "node:assert/strict";

const baseUrl = process.env.API_URL || "http://localhost:4000";
const jsonHeaders = { "Content-Type": "application/json" };

async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, options);
    const body = await response.json().catch(() => null);
    return { response, body };
}

async function runTests() {
    // GET all products
    let result = await request("/products");
    assert.equal(result.response.status, 200);
    assert.ok(Array.isArray(result.body));
    const initialCount = result.body.length;
    assert.ok(initialCount > 0, "products.json should contain sample products");

    // GET one product
    result = await request("/products/1");
    assert.equal(result.response.status, 200);
    assert.equal(result.body.id, 1);

    // GET with an invalid id
    result = await request("/products/abc");
    assert.equal(result.response.status, 400);

    // GET a missing product
    result = await request("/products/9999");
    assert.equal(result.response.status, 404);

    // POST with incomplete data must fail
    result = await request("/products", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ name: "Incomplete Product" })
    });
    assert.equal(result.response.status, 400);

    // POST a valid product
    result = await request("/products", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ name: "Test Product", category: "Testing", price: 25.5, stock: 10 })
    });
    assert.equal(result.response.status, 201);
    const createdId = result.body.product.id;
    assert.equal(result.body.product.name, "Test Product");

    // PUT replaces every field
    result = await request(`/products/${createdId}`, {
        method: "PUT",
        headers: jsonHeaders,
        body: JSON.stringify({ name: "Replaced Product", category: "Updated", price: 30, stock: 12 })
    });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.product.name, "Replaced Product");
    assert.equal(result.body.product.category, "Updated");

    // PATCH changes only the sent field
    result = await request(`/products/${createdId}`, {
        method: "PATCH",
        headers: jsonHeaders,
        body: JSON.stringify({ price: 35 })
    });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.product.price, 35);
    assert.equal(result.body.product.stock, 12);

    // PATCH with an unknown field must fail
    result = await request(`/products/${createdId}`, {
        method: "PATCH",
        headers: jsonHeaders,
        body: JSON.stringify({ rating: 5 })
    });
    assert.equal(result.response.status, 400);

    // DELETE the created product
    result = await request(`/products/${createdId}`, { method: "DELETE" });
    assert.equal(result.response.status, 200);

    // The deleted product is gone
    result = await request(`/products/${createdId}`);
    assert.equal(result.response.status, 404);

    // The product list is back to its original size
    result = await request("/products");
    assert.equal(result.body.length, initialCount);

    console.log("All GET, POST, PUT, PATCH and DELETE product API tests passed.");
}

runTests().catch(error => {
    console.error("API test failed:", error.message);
    process.exitCode = 1;
});
