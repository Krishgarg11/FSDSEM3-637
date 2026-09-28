import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Resolve ES module file and directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "requests.json");

// Middleware to parse incoming JSON and urlencoded requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Ensure requests.json exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

/**
 * Helper function: Read requests from requests.json file
 * @returns {Array} Array of request objects
 */
function readRequests() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, "[]", "utf8");
      return [];
    }
    const fileData = fs.readFileSync(DATA_FILE, "utf8");
    if (!fileData.trim()) {
      return [];
    }
    return JSON.parse(fileData);
  } catch (error) {
    console.error("Error reading requests.json:", error.message);
    return [];
  }
}

/**
 * Helper function: Write requests array into requests.json file
 * @param {Array} data - Array of requests
 * @returns {boolean} True if successful, false otherwise
 */
function writeRequests(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing requests.json:", error.message);
    return false;
  }
}

/**
 * Validation helper function for request body data
 * @param {Object} body - Request body containing student request details
 * @returns {string|null} Error message if invalid, null if valid
 */
function validateRequestBody(body) {
  const { studentName, email, category, description, priority } = body;

  if (!studentName || !email || !category || !description || !priority) {
    return "All fields are required: studentName, email, category, description, priority.";
  }

  if (
    typeof studentName !== "string" || studentName.trim() === "" ||
    typeof email !== "string" || email.trim() === "" ||
    typeof category !== "string" || category.trim() === "" ||
    typeof description !== "string" || description.trim() === "" ||
    typeof priority !== "string" || priority.trim() === ""
  ) {
    return "Invalid input data. All fields must be non-empty strings.";
  }

  // Basic email pattern check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please provide a valid email address.";
  }

  return null;
}

// ==========================================
// API ENDPOINTS
// ==========================================

/**
 * 1. GET /api/requests
 * Description: Retrieve all campus help desk requests
 */
app.get("/api/requests", (req, res) => {
  try {
    const requests = readRequests();
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: "Failed to read requests from file." });
  }
});

/**
 * 2. GET /api/requests/:id
 * Description: Retrieve a single request by its ID
 */
app.get("/api/requests/:id", (req, res) => {
  try {
    const requestId = req.params.id;
    const requests = readRequests();

    const request = requests.find((item) => String(item.id) === String(requestId));

    if (!request) {
      return res.status(404).json({
        error: `Request with ID '${requestId}' not found.`
      });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch request." });
  }
});

/**
 * 3. POST /api/requests
 * Description: Create a new campus help desk request
 */
app.post("/api/requests", (req, res) => {
  try {
    const validationError = validateRequestBody(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { studentName, email, category, description, priority } = req.body;
    const requests = readRequests();

    // Generate a unique incremental numeric ID
    let nextId = 1;
    if (requests.length > 0) {
      const numericIds = requests
        .map((r) => Number(r.id))
        .filter((n) => !isNaN(n));
      nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : Date.now();
    }

    const newRequest = {
      id: nextId,
      studentName: studentName.trim(),
      email: email.trim(),
      category: category.trim(),
      description: description.trim(),
      priority: priority.trim(),
      createdAt: new Date().toISOString()
    };

    requests.push(newRequest);

    if (!writeRequests(requests)) {
      return res.status(500).json({ error: "Could not save request to requests.json" });
    }

    res.status(201).json({
      message: "Request submitted successfully.",
      request: newRequest
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error while creating request." });
  }
});

/**
 * 4. PUT /api/requests/:id
 * Description: Update an existing request by ID
 */
app.put("/api/requests/:id", (req, res) => {
  try {
    const requestId = req.params.id;
    const validationError = validateRequestBody(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { studentName, email, category, description, priority } = req.body;
    const requests = readRequests();

    const index = requests.findIndex((item) => String(item.id) === String(requestId));

    if (index === -1) {
      return res.status(404).json({
        error: `Request with ID '${requestId}' not found.`
      });
    }

    // Preserve ID and creation time while updating data
    const existing = requests[index];
    const updatedRequest = {
      ...existing,
      studentName: studentName.trim(),
      email: email.trim(),
      category: category.trim(),
      description: description.trim(),
      priority: priority.trim(),
      updatedAt: new Date().toISOString()
    };

    requests[index] = updatedRequest;

    if (!writeRequests(requests)) {
      return res.status(500).json({ error: "Could not save updated request to requests.json" });
    }

    res.status(200).json({
      message: "Request updated successfully.",
      request: updatedRequest
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error while updating request." });
  }
});

/**
 * 5. DELETE /api/requests/:id
 * Description: Delete a request by ID
 */
app.delete("/api/requests/:id", (req, res) => {
  try {
    const requestId = req.params.id;
    const requests = readRequests();

    const index = requests.findIndex((item) => String(item.id) === String(requestId));

    if (index === -1) {
      return res.status(404).json({
        error: `Request with ID '${requestId}' not found.`
      });
    }

    const [deletedRequest] = requests.splice(index, 1);

    if (!writeRequests(requests)) {
      return res.status(500).json({ error: "Could not delete request from requests.json" });
    }

    res.status(200).json({
      message: "Request deleted successfully.",
      request: deletedRequest
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error while deleting request." });
  }
});

// Root route serves index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the Express server
app.listen(PORT, () => {
  console.log("==================================================");
  console.log(` 🏫 Campus Help Desk Server is running!`);
  console.log(` 🌐 Open Web Portal: http://localhost:${PORT}`);
  console.log(` 📡 API Base URL:    http://localhost:${PORT}/api/requests`);
  console.log("==================================================");
});
