# Krish Garg Portfolio

A clean, dark, responsive personal portfolio for Krish Garg, a first-year B.Tech Computer Science Engineering student interested in Python, data analytics, AI/ML, and problem solving.

## Technologies

- Node.js and Express.js
- HTML5 and CSS3
- Vanilla JavaScript
- No database or frontend framework

## Structure

```text
portfolio/
├── server.js
├── package.json
├── README.md
├── public/
│   ├── css/style.css
│   ├── js/script.js
│   └── images/
└── views/
    └── index.html
```

## Installation and run

```powershell
cd FSDSEM3-637/portfolio
npm install
npm start
```

Open `http://localhost:3000` in a browser.

## Express routes

- `GET /` serves the portfolio page.
- `GET /resume` is ready for a future resume PDF.
- `GET /api/projects` returns the project array as JSON.
- `POST /contact` validates and accepts contact form data without sending email.
- Unknown routes return a JSON 404 response.

## Customize personal information

Edit text and contact details in `views/index.html`. Replace `your.email@example.com`, the GitHub URL, and the LinkedIn URL with real details. The project cards currently use clearly marked placeholder links.

## Add projects

Update the `projects` array in `server.js` for the API, and update the project cards in `views/index.html` for the visible page. Replace each `#` GitHub or demo link with the real URL.

## Add a resume

Place a PDF named `resume.pdf` inside `public/`. Then update the `/resume` route in `server.js` to send that file, for example with `res.sendFile(path.join(__dirname, 'public', 'resume.pdf'))`.

## Remaining TODOs

- Replace placeholder contact and social links.
- Add real GitHub and live demo URLs.
- Add `public/resume.pdf` when ready.
- Replace or add project images in `public/images/` if desired.
