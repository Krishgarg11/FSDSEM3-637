const express = require("express");

const app = express();
app.use(express.json());

let products = [];
let nextProductId = 1;

const productFields = ["name", "price", "category", "stock"];

function isValidProductFields(product) {
    return typeof product.name === "string" && product.name.trim() !== ""
        && typeof product.category === "string" && product.category.trim() !== ""
        && typeof product.price === "number" && Number.isFinite(product.price) && product.price >= 0
        && Number.isInteger(product.stock) && product.stock >= 0;
}

function parseProductId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function findProductId(req, res) {
    const id = parseProductId(req.params.id);
    if (id === null) {
        res.status(400).json({ message: "Product ID must be a positive integer" });
        return null;
    }
    return id;
}

// Creating 100 products
for (let i = 1; i <= 100; i++) {
    products.push({
        id: i,
        name: "Product " + i,
        price: i * 100,
        category: i % 2 === 0 ? "Electronics" : "Clothing",
        stock: 10 + i
    });
}
nextProductId = products.length + 1;

// GET all products
app.get("/products", (req, res) => {
    res.json(products);
});

// GET product by ID
app.get("/products/:id", (req, res) => {
    const id = findProductId(req, res);
    if (id === null) return;
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    res.json(product);
});

// POST - Add new product
app.post("/products", (req, res) => {
    if (!isValidProductFields(req.body)) {
        return res.status(400).json({
            message: "name and category must be non-empty strings; price must be a non-negative number; stock must be a non-negative integer"
        });
    }

    const newProduct = {
        id: nextProductId++,
        name: req.body.name.trim(),
        price: req.body.price,
        category: req.body.category.trim(),
        stock: req.body.stock
    };

    products.push(newProduct);

    res.status(201).json({
        message: "Product added successfully",
        product: newProduct
    });
});

// PUT - Update complete product
app.put("/products/:id", (req, res) => {
    const id = findProductId(req, res);
    if (id === null) return;
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    if (!isValidProductFields(req.body)) {
        return res.status(400).json({
            message: "PUT requires name, price, category, and stock with valid values"
        });
    }

    product.name = req.body.name.trim();
    product.price = req.body.price;
    product.category = req.body.category.trim();
    product.stock = req.body.stock;

    res.json({
        message: "Product updated successfully",
        product: product
    });
});

// PATCH - Update selected fields
app.patch("/products/:id", (req, res) => {
    const id = findProductId(req, res);
    if (id === null) return;
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    const updates = Object.keys(req.body);
    if (updates.length === 0 || updates.some(field => !productFields.includes(field))) {
        return res.status(400).json({ message: "PATCH must contain one or more product fields only" });
    }

    const updatedProduct = { ...product, ...req.body };
    if (!isValidProductFields(updatedProduct)) {
        return res.status(400).json({ message: "PATCH contains invalid product values" });
    }

    Object.assign(product, updatedProduct, {
        name: updatedProduct.name.trim(),
        category: updatedProduct.category.trim()
    });

    res.json({
        message: "Product partially updated",
        product: product
    });
});

// DELETE product
app.delete("/products/:id", (req, res) => {
    const id = findProductId(req, res);
    if (id === null) return;
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    const deletedProduct = products.splice(index, 1);

    res.json({
        message: "Product deleted successfully",
        product: deletedProduct[0]
    });
});

if (require.main === module) {
    app.listen(3000, () => {
        console.log("Server running on http://localhost:3000");
    });
}

module.exports = { app, products };
