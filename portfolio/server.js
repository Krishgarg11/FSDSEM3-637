import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projects = [
    {
        name: 'Yojana Saathi',
        description: 'AI/RAG based document guidance project designed to help users understand required documents and scheme-related information.',
        technologies: ['Python', 'FastAPI', 'RAG', 'AI', 'JSON'],
        github: '#',
        demo: '#'
    },
    {
        name: 'Product REST API',
        description: 'A beginner-friendly CRUD API with validation for creating, reading, updating, and deleting product records.',
        technologies: ['Node.js', 'Express.js', 'REST API'],
        github: '#',
        demo: '#'
    },
    {
        name: 'Node Modules Practice',
        description: 'Small experiments exploring events, file systems, HTTP servers, and asynchronous JavaScript.',
        technologies: ['JavaScript', 'Node.js', 'Core Modules'],
        github: '#',
        demo: '#'
    }
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/resume', (req, res) => {
    res.status(200).send('Resume PDF will be available here soon. Add your file at public/resume.pdf.');
});

app.get('/api/projects', (req, res) => {
    res.json(projects);
});

app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
        return res.status(400).json({ success: false, message: 'Please fill in your name, email, and message.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    console.log(`New message from ${name.trim()} <${email.trim()}>`);
    res.status(201).json({ success: true, message: 'Thanks! Your message has been received.' });
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Page not found.' });
});

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ success: false, message: 'Something went wrong on the server.' });
});

app.listen(port, () => {
    console.log(`Portfolio running on http://localhost:${port}`);
});
