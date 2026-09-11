import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

const htmlPath = path.join(__dirname, 'index.html');
let products = [];
let nextProductId = 1;
const productFields = ['name', 'price', 'category', 'stock'];

function isValidProduct(product) {
    return typeof product.name === 'string' && product.name.trim() !== ''
        && typeof product.category === 'string' && product.category.trim() !== ''
        && typeof product.price === 'number' && Number.isFinite(product.price) && product.price >= 0
        && Number.isInteger(product.stock) && product.stock >= 0;
}

function getProductId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

app.get('/', (req, res) => {
    res.sendFile(htmlPath);
});

app.get('/products', (req, res) => {
    res.json(products);
});

app.get('/products/:id', (req, res) => {
    const id = getProductId(req.params.id);
    const product = products.find(item => item.id === id);
    if (!id) return res.status(400).json({ message: 'Product ID must be a positive integer' });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
});

app.post('/products', (req, res) => {
    if (!isValidProduct(req.body)) {
        return res.status(400).json({ message: 'name, price, category, and stock are required with valid values' });
    }
    const product = {
        id: nextProductId++,
        name: req.body.name.trim(),
        price: req.body.price,
        category: req.body.category.trim(),
        stock: req.body.stock
    };
    products.push(product);
    res.status(201).json({ message: 'Product added successfully', product });
});

function findProduct(req, res) {
    const id = getProductId(req.params.id);
    if (!id) {
        res.status(400).json({ message: 'Product ID must be a positive integer' });
        return null;
    }
    const product = products.find(item => item.id === id);
    if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return null;
    }
    return product;
}

app.put('/products/:id', (req, res) => {
    const product = findProduct(req, res);
    if (!product) return;
    if (!isValidProduct(req.body)) {
        return res.status(400).json({ message: 'PUT requires name, price, category, and stock with valid values' });
    }
    Object.assign(product, {
        name: req.body.name.trim(),
        price: req.body.price,
        category: req.body.category.trim(),
        stock: req.body.stock
    });
    res.json({ message: 'Product updated successfully', product });
});

app.patch('/products/:id', (req, res) => {
    const product = findProduct(req, res);
    if (!product) return;
    const updates = Object.keys(req.body);
    if (!updates.length || updates.some(field => !productFields.includes(field))) {
        return res.status(400).json({ message: 'PATCH must contain one or more product fields only' });
    }
    const updatedProduct = { ...product, ...req.body };
    if (!isValidProduct(updatedProduct)) {
        return res.status(400).json({ message: 'PATCH contains invalid product values' });
    }
    Object.assign(product, updatedProduct, {
        name: updatedProduct.name.trim(),
        category: updatedProduct.category.trim()
    });
    res.json({ message: 'Product partially updated', product });
});

app.delete('/products/:id', (req, res) => {
    const id = getProductId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Product ID must be a positive integer' });
    const index = products.findIndex(item => item.id === id);
    if (index === -1) return res.status(404).json({ message: 'Product not found' });
    const product = products.splice(index, 1)[0];
    res.json({ message: 'Product deleted successfully', product });
});

app.listen(3000, () => {
    console.log('Product API server is running on http://localhost:3000');
});