import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const app = express();
const PORT = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRODUCTS_FILE = path.join(__dirname, "products.json");

app.use(cors());
app.use(express.json());

// The only fields a product is allowed to have.
const PRODUCT_FIELDS = ["name", "category", "price", "stock"];

function readProducts() {
    const data = fs.readFileSync(PRODUCTS_FILE, "utf-8");
    return JSON.parse(data);
}

function saveProducts(products) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

function getNextId(products) {
    return products.reduce((max, product) => Math.max(max, product.id), 0) + 1;
}

function parseProductId(req) {
    const id = Number(req.params.id);
    return Number.isInteger(id) && id > 0 ? id : null;
}

// Keeps only the fields a product may have and normalizes their types.
function pickProductFields(body) {
    const fields = {};

    if (!body || typeof body !== "object") {
        return fields;
    }

    if (body.name !== undefined) fields.name = String(body.name).trim();
    if (body.category !== undefined) fields.category = String(body.category).trim();
    if (body.price !== undefined) fields.price = Number(body.price);
    if (body.stock !== undefined) fields.stock = Number(body.stock);

    return fields;
}

function isValidProduct(fields, { requireAll = true } = {}) {
    const keys = Object.keys(fields);

    if (keys.length === 0) return false;
    if (requireAll && PRODUCT_FIELDS.some(field => !keys.includes(field))) return false;

    if (fields.name !== undefined && fields.name === "") return false;
    if (fields.category !== undefined && fields.category === "") return false;
    if (fields.price !== undefined && (!Number.isFinite(fields.price) || fields.price < 0)) return false;
    if (fields.stock !== undefined && (!Number.isInteger(fields.stock) || fields.stock < 0)) return false;

    return true;
}

const INVALID_PRODUCT_MESSAGE =
    "Please send a valid name, category, price (0 or more) and stock (whole number, 0 or more)";

// Friendly landing response so opening the API in a browser makes sense.
app.get("/", (req, res) => {
    res.json({
        message: "Product API is running",
        endpoints: [
            "GET /products",
            "GET /products/:id",
            "POST /products",
            "PUT /products/:id",
            "PATCH /products/:id",
            "DELETE /products/:id"
        ]
    });
});

// GET all products
app.get("/products", (req, res) => {
    const products = readProducts();
    res.json(products);
});

// GET one product by id
app.get("/products/:id", (req, res) => {
    const id = parseProductId(req);

    if (id === null) {
        return res.status(400).json({ message: "ID must be a valid positive number" });
    }

    const product = readProducts().find(item => item.id === id);

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
});

// POST - create a new product
app.post("/products", (req, res) => {
    const fields = pickProductFields(req.body);

    if (!isValidProduct(fields)) {
        return res.status(400).json({ message: INVALID_PRODUCT_MESSAGE });
    }

    const products = readProducts();
    const product = { id: getNextId(products), ...fields };

    products.push(product);
    saveProducts(products);

    res.status(201).json({ message: "Product added successfully", product });
});

// PUT - replace every field of a product
app.put("/products/:id", (req, res) => {
    const id = parseProductId(req);

    if (id === null) {
        return res.status(400).json({ message: "ID must be a valid positive number" });
    }

    const products = readProducts();
    const index = products.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Product not found" });
    }

    const fields = pickProductFields(req.body);

    if (!isValidProduct(fields)) {
        return res.status(400).json({ message: INVALID_PRODUCT_MESSAGE });
    }

    const product = { id, ...fields };

    products[index] = product;
    saveProducts(products);

    res.json({ message: "Product updated successfully", product });
});

// PATCH - update only the fields that were sent
app.patch("/products/:id", (req, res) => {
    const id = parseProductId(req);

    if (id === null) {
        return res.status(400).json({ message: "ID must be a valid positive number" });
    }

    const products = readProducts();
    const index = products.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Product not found" });
    }

    const sentFields = Object.keys(req.body || {});

    if (sentFields.length === 0 || sentFields.some(field => !PRODUCT_FIELDS.includes(field))) {
        return res.status(400).json({
            message: "Only name, category, price and stock can be updated"
        });
    }

    const fields = pickProductFields(req.body);
    const product = { ...products[index], ...fields };

    if (!isValidProduct(product)) {
        return res.status(400).json({ message: INVALID_PRODUCT_MESSAGE });
    }

    products[index] = product;
    saveProducts(products);

    res.json({ message: "Product updated partially", product });
});

// DELETE - remove a product
app.delete("/products/:id", (req, res) => {
    const id = parseProductId(req);

    if (id === null) {
        return res.status(400).json({ message: "ID must be a valid positive number" });
    }

    const products = readProducts();
    const index = products.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Product not found" });
    }

    const deletedProduct = products.splice(index, 1)[0];
    saveProducts(products);

    res.json({ message: "Product deleted successfully", product: deletedProduct });
});

// Unknown route
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Malformed JSON and other unexpected errors
app.use((err, req, res, _next) => {
    console.error(err.message);
    res.status(err.status || 500).json({ message: err.message || "Something went wrong" });
});

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    app.listen(PORT, () => {
        console.log(`Product API running on http://localhost:${PORT}`);
    });
}

export { app };
