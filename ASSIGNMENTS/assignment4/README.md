# 🏫 Campus Help Desk - Mini Project

A web application for campus students to submit, track, edit, and manage university-related problems and service requests. Built with **Node.js, Express (ES Modules), JSON file storage (`fs`), and Vanilla JavaScript Fetch API**.

---

## 📁 Project Structure

```text
assignment4/
│
├── package.json          # ES Module config ("type": "module"), scripts, & dependencies
├── server.js             # Express backend with 5 CRUD REST API routes using ES Modules & fs
├── requests.json         # JSON data store initialized with []
├── requests.http         # Sample HTTP requests for testing with VS Code REST Client
├── test-api.js           # Automated test script for all 5 CRUD endpoints
├── README.md             # Project documentation and API testing guide
│
└── public/               # Frontend static assets served by Express
    ├── index.html        # Responsive UI with Submit Form, Filters, Feed, and Edit Modal
    ├── style.css         # Modern, responsive CSS design with cards & priority badges
    └── script.js         # Frontend fetch() logic for GET, POST, PUT, DELETE operations
```

---

## 🛠️ Technology Stack

* **Runtime:** Node.js (v18+)
* **Backend:** Express.js (`^4.21.2`) configured with **ES Modules (`"type": "module"`)**
* **Persistence:** Node.js `fs` module writing to `requests.json`
* **Frontend:** Semantic HTML5, Vanilla CSS3, Vanilla JavaScript with native `fetch()` API
* **No databases or third-party frontend frameworks used**

---

## 🚀 How to Run the Project

### 1. Install Dependencies
Open your terminal in the `assignment4` directory:
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```
* The server will start on: **`http://localhost:3000`**
* Open **`http://localhost:3000`** in any web browser to view the interactive web portal.

---

## 📡 REST API Endpoints

All endpoints use JSON payloads and return JSON responses.

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/requests` | Get all campus requests | `200 OK` |
| **GET** | `/api/requests/:id` | Get a single request by ID | `200 OK`, `404 Not Found` |
| **POST** | `/api/requests` | Create a new campus request | `201 Created`, `400 Bad Request` |
| **PUT** | `/api/requests/:id` | Update an existing request by ID | `200 OK`, `400 Bad Request`, `404 Not Found` |
| **DELETE** | `/api/requests/:id` | Delete a request by ID | `200 OK`, `404 Not Found` |

---

## 📋 Request Object Schema

Each request object contains the following fields:

```json
{
  "id": 1,
  "studentName": "Alex Johnson",
  "email": "alex.j@university.edu",
  "category": "IT & Wi-Fi Network",
  "description": "Wi-Fi in library 2nd floor disconnects repeatedly.",
  "priority": "High",
  "createdAt": "2026-09-28T04:00:00.000Z"
}
```

---

## 🧪 Testing the API Endpoints

### Option A: Automated Test Script
While the server is running (`npm start`), open a second terminal and run:
```bash
npm test
```
or
```bash
node test-api.js
```

### Option B: Using cURL in Terminal / PowerShell

1. **Create a Request (POST):**
   ```bash
   curl -X POST http://localhost:3000/api/requests -H "Content-Type: application/json" -d "{\"studentName\":\"John Doe\",\"email\":\"john@campus.edu\",\"category\":\"IT & Wi-Fi Network\",\"description\":\"Cannot access portal\",\"priority\":\"High\"}"
   ```

2. **Get All Requests (GET):**
   ```bash
   curl http://localhost:3000/api/requests
   ```

3. **Get Single Request (GET by ID):**
   ```bash
   curl http://localhost:3000/api/requests/1
   ```

4. **Update Request (PUT):**
   ```bash
   curl -X PUT http://localhost:3000/api/requests/1 -H "Content-Type: application/json" -d "{\"studentName\":\"John Doe\",\"email\":\"john@campus.edu\",\"category\":\"IT & Wi-Fi Network\",\"description\":\"Issue resolved partially\",\"priority\":\"Urgent\"}"
   ```

5. **Delete Request (DELETE):**
   ```bash
   curl -X DELETE http://localhost:3000/api/requests/1
   ```

---

## ✨ Features Included

* ✅ **ES Modules throughout** (`import ... from "..."`)
* ✅ **Zero database dependencies** — robust file storage in `requests.json`
* ✅ **Interactive Browser UI** with real-time counters, search filter, category filter, and priority filter
* ✅ **Edit Modal** for in-place updating of submitted requests
* ✅ **Confirmation on Delete** and Toast Notification alerts
* ✅ **Validation & Error Handling** for missing fields, bad email format, and invalid/non-existent IDs
