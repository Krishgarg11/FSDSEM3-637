import express from "express";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const app = express();
const port = 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// Simple homepage for browser testing
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

let products = [];
let nextId = 1;

// Create 100 sample products
for (let i = 1; i <= 100; i++) {
    products.push({
        id: i,
        name: "Product " + i,
        price: i * 100,
        category: i % 2 === 0 ? "Electronics" : "Clothing",
        stock: 10 + i
    });
}

nextId = products.length + 1;

function checkProductData(product) {
    return product &&
        typeof product.name === "string" && product.name.trim() !== "" &&
        typeof product.category === "string" && product.category.trim() !== "" &&
        typeof product.price === "number" && Number.isFinite(product.price) && product.price >= 0 &&
        Number.isInteger(product.stock) && product.stock >= 0;
}

function getProductIdFromRoute(req) {
    const id = Number(req.params.id);
    return Number.isInteger(id) && id > 0 ? id : null;
}

// GET all products
app.get("/products", (req, res) => {
    res.json(products);
});

// GET one product by ID
app.get("/products/:id", (req, res) => {
    const id = getProductIdFromRoute(req);

    if (id === null) {
        return res.status(400).json({ message: "ID must be a valid positive number" });
    }

    const product = products.find(item => item.id === id);

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
});

// POST - create new product
app.post("/products", (req, res) => {
    const newProduct = req.body;

    if (!checkProductData(newProduct)) {
        return res.status(400).json({
            message: "Please send valid name, category, price and stock"
        });
    }

    const productToSave = {
        id: nextId++,
        name: newProduct.name.trim(),
        category: newProduct.category.trim(),
        price: newProduct.price,
        stock: newProduct.stock
    };

    products.push(productToSave);

    res.status(201).json({
        message: "Product added successfully",
        product: productToSave
    });
});

// PUT - replace full product details
app.put("/products/:id", (req, res) => {
    const id = getProductIdFromRoute(req);

    if (id === null) {
        return res.status(400).json({ message: "ID must be a valid positive number" });
    }

    const product = products.find(item => item.id === id);

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    if (!checkProductData(req.body)) {
        return res.status(400).json({ message: "Please provide all valid product fields" });
    }

    product.name = req.body.name.trim();
    product.category = req.body.category.trim();
    product.price = req.body.price;
    product.stock = req.body.stock;

    res.json({
        message: "Product updated successfully",
        product: product
    });
});

// PATCH - update only some fields
app.patch("/products/:id", (req, res) => {
    const id = getProductIdFromRoute(req);

    if (id === null) {
        return res.status(400).json({ message: "ID must be a valid positive number" });
    }

    const product = products.find(item => item.id === id);

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    const allowedFields = ["name", "price", "category", "stock"];
    const sentFields = Object.keys(req.body);

    if (sentFields.length === 0 || sentFields.some(field => !allowedFields.includes(field))) {
        return res.status(400).json({ message: "Only name, price, category, and stock can be updated" });
    }

    const updatedProduct = { ...product, ...req.body };

    if (!checkProductData(updatedProduct)) {
        return res.status(400).json({ message: "Updated product values are invalid" });
    }

    product.name = updatedProduct.name.trim();
    product.category = updatedProduct.category.trim();
    product.price = updatedProduct.price;
    product.stock = updatedProduct.stock;

    res.json({
        message: "Product updated partially",
        product: product
    });
});

// DELETE - remove product
app.delete("/products/:id", (req, res) => {
    const id = getProductIdFromRoute(req);

    if (id === null) {
        return res.status(400).json({ message: "ID must be a valid positive number" });
    }

    const index = products.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Product not found" });
    }

    const deletedProduct = products.splice(index, 1)[0];

    res.json({
        message: "Product deleted successfully",
        product: deletedProduct
    });
});

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    app.listen(port, () => {
        console.log(`Product API running on http://localhost:${port}`);
    });
}

export { app, products };
