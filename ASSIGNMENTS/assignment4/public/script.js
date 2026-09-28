/**
 * Campus Help Desk - Client-side Logic (Vanilla JavaScript & Fetch API)
 */

// Global state for requests
let requestsData = [];

// DOM Elements
const newRequestForm = document.getElementById("newRequestForm");
const editRequestForm = document.getElementById("editRequestForm");
const requestsContainer = document.getElementById("requestsContainer");
const totalCountElem = document.getElementById("totalCount");
const urgentCountElem = document.getElementById("urgentCount");
const refreshBtn = document.getElementById("refreshBtn");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const priorityFilter = document.getElementById("priorityFilter");

// Modal Elements
const editModal = document.getElementById("editModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const editModalId = document.getElementById("editModalId");
const editRequestId = document.getElementById("editRequestId");
const editStudentName = document.getElementById("editStudentName");
const editEmail = document.getElementById("editEmail");
const editCategory = document.getElementById("editCategory");
const editPriority = document.getElementById("editPriority");
const editDescription = document.getElementById("editDescription");

const toastContainer = document.getElementById("toastContainer");

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Load initial requests from server
  fetchRequests();

  // Attach Event Listeners
  newRequestForm.addEventListener("submit", handleCreateRequest);
  editRequestForm.addEventListener("submit", handleUpdateRequest);
  refreshBtn.addEventListener("click", () => {
    fetchRequests(true);
  });

  // Filter & Search listeners
  searchInput.addEventListener("input", applyFiltersAndRender);
  categoryFilter.addEventListener("change", applyFiltersAndRender);
  priorityFilter.addEventListener("change", applyFiltersAndRender);

  // Modal close handlers
  closeModalBtn.addEventListener("click", closeEditModal);
  cancelModalBtn.addEventListener("click", closeEditModal);

  // Close modal when clicking on backdrop
  editModal.addEventListener("click", (e) => {
    if (e.target === editModal) {
      closeEditModal();
    }
  });

  // Close modal on ESC key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !editModal.classList.contains("hidden")) {
      closeEditModal();
    }
  });
});

// ==========================================
// FETCH API CALLS
// ==========================================

/**
 * 1. GET /api/requests
 * Fetch all requests from the backend API
 */
async function fetchRequests(showToastNotification = false) {
  try {
    renderLoading();
    const response = await fetch("/api/requests");

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    requestsData = Array.isArray(data) ? data : [];

    updateCounters();
    applyFiltersAndRender();

    if (showToastNotification) {
      showToast("Requests refreshed successfully.", "info");
    }
  } catch (error) {
    console.error("Error fetching requests:", error);
    renderError("Unable to load campus requests. Please check if the server is running.");
    showToast("Failed to load requests from server", "error");
  }
}

/**
 * 2. POST /api/requests
 * Create a new campus help desk request
 */
async function handleCreateRequest(e) {
  e.preventDefault();

  const studentName = document.getElementById("studentName").value.trim();
  const email = document.getElementById("email").value.trim();
  const category = document.getElementById("category").value;
  const priority = document.getElementById("priority").value;
  const description = document.getElementById("description").value.trim();

  // Frontend validation
  if (!studentName || !email || !category || !priority || !description) {
    showToast("Please fill in all required fields.", "error");
    return;
  }

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.innerText = "Submitting...";

  const payload = {
    studentName,
    email,
    category,
    priority,
    description
  };

  try {
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to submit request.");
    }

    showToast("Request submitted successfully!", "success");
    newRequestForm.reset();
    await fetchRequests();
  } catch (error) {
    console.error("Error creating request:", error);
    showToast(error.message || "Failed to create request", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
      <span>Submit Request</span>
    `;
  }
}

/**
 * 3. PUT /api/requests/:id
 * Update an existing request
 */
async function handleUpdateRequest(e) {
  e.preventDefault();

  const id = editRequestId.value;
  const studentName = editStudentName.value.trim();
  const email = editEmail.value.trim();
  const category = editCategory.value;
  const priority = editPriority.value;
  const description = editDescription.value.trim();

  if (!id || !studentName || !email || !category || !priority || !description) {
    showToast("Please fill in all required fields.", "error");
    return;
  }

  const saveBtn = document.getElementById("saveEditBtn");
  saveBtn.disabled = true;
  saveBtn.innerText = "Saving...";

  const payload = {
    studentName,
    email,
    category,
    priority,
    description
  };

  try {
    const response = await fetch(`/api/requests/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to update request.");
    }

    showToast(`Request #${id} updated successfully!`, "success");
    closeEditModal();
    await fetchRequests();
  } catch (error) {
    console.error("Error updating request:", error);
    showToast(error.message || "Failed to update request", "error");
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
      </svg>
      <span>Save Changes</span>
    `;
  }
}

/**
 * 4. DELETE /api/requests/:id
 * Delete a request from the backend
 */
async function deleteRequest(id, studentName) {
  const confirmed = confirm(`Are you sure you want to delete Request #${id} submitted by "${studentName}"?`);
  if (!confirmed) return;

  try {
    const response = await fetch(`/api/requests/${id}`, {
      method: "DELETE"
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to delete request.");
    }

    showToast(`Request #${id} deleted successfully.`, "success");
    await fetchRequests();
  } catch (error) {
    console.error("Error deleting request:", error);
    showToast(error.message || "Failed to delete request", "error");
  }
}

// ==========================================
// MODAL CONTROLS
// ==========================================

function openEditModal(request) {
  editRequestId.value = request.id;
  editModalId.textContent = `#${request.id}`;
  editStudentName.value = request.studentName || "";
  editEmail.value = request.email || "";
  editCategory.value = request.category || "General Query";
  editPriority.value = request.priority || "Medium";
  editDescription.value = request.description || "";

  editModal.classList.remove("hidden");
  editModal.setAttribute("aria-hidden", "false");
  editStudentName.focus();
}

function closeEditModal() {
  editModal.classList.add("hidden");
  editModal.setAttribute("aria-hidden", "true");
  editRequestForm.reset();
}

// ==========================================
// RENDER & FILTER FUNCTIONS
// ==========================================

function updateCounters() {
  totalCountElem.textContent = requestsData.length;

  const urgentOrHighCount = requestsData.filter(
    (r) => r.priority === "Urgent" || r.priority === "High"
  ).length;

  urgentCountElem.textContent = urgentOrHighCount;
}

function applyFiltersAndRender() {
  const query = searchInput.value.toLowerCase().trim();
  const selectedCat = categoryFilter.value;
  const selectedPri = priorityFilter.value;

  const filtered = requestsData.filter((item) => {
    // Search query match
    const matchesSearch =
      !query ||
      String(item.id).includes(query) ||
      (item.studentName && item.studentName.toLowerCase().includes(query)) ||
      (item.email && item.email.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query));

    // Category match
    const matchesCat = selectedCat === "ALL" || item.category === selectedCat;

    // Priority match
    const matchesPri = selectedPri === "ALL" || item.priority === selectedPri;

    return matchesSearch && matchesCat && matchesPri;
  });

  renderRequestsList(filtered);
}

function renderRequestsList(requests) {
  if (requests.length === 0) {
    if (requestsData.length === 0) {
      requestsContainer.innerHTML = `
        <div class="empty-state">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <h3>No Requests Yet</h3>
          <p>No campus requests have been submitted. Use the form on the left to submit the first request!</p>
        </div>
      `;
    } else {
      requestsContainer.innerHTML = `
        <div class="empty-state">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3>No Matching Requests</h3>
          <p>No requests match your current search or filter criteria. Try clearing filters.</p>
        </div>
      `;
    }
    return;
  }

  // Generate cards
  const cardsHtml = requests
    .map((request) => {
      const initials = getInitials(request.studentName);
      const priorityClass = getPriorityClass(request.priority);
      const formattedDate = formatDate(request.createdAt);

      return `
        <article class="request-item-card" data-id="${request.id}">
          <div class="card-top-row">
            <div class="student-meta">
              <div class="student-avatar">${escapeHtml(initials)}</div>
              <div class="student-info">
                <h4>${escapeHtml(request.studentName)}</h4>
                <p>${escapeHtml(request.email)}</p>
              </div>
            </div>

            <div class="card-badges">
              <span class="badge id-badge">#${request.id}</span>
              <span class="badge badge-category">${escapeHtml(request.category)}</span>
              <span class="badge ${priorityClass}">${escapeHtml(request.priority)}</span>
            </div>
          </div>

          <div class="card-body-description">${escapeHtml(request.description)}</div>

          <div class="card-footer-row">
            <span class="card-date">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline; vertical-align:middle; margin-right:4px;">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              ${formattedDate}
            </span>

            <div class="card-actions">
              <button class="action-btn btn-edit" onclick="handleEditClick(${request.id})">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                <span>Edit</span>
              </button>
              <button class="action-btn btn-delete" onclick="handleDeleteClick(${request.id}, '${escapeHtml(request.studentName)}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  requestsContainer.innerHTML = cardsHtml;
}

// Global button helper bridges for inline onclicks
window.handleEditClick = function (id) {
  const req = requestsData.find((r) => String(r.id) === String(id));
  if (req) {
    openEditModal(req);
  } else {
    showToast("Request not found", "error");
  }
};

window.handleDeleteClick = function (id, studentName) {
  deleteRequest(id, studentName);
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function getInitials(name) {
  if (!name) return "ST";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getPriorityClass(priority) {
  switch (priority) {
    case "Urgent":
      return "badge-urgent";
    case "High":
      return "badge-high";
    case "Medium":
      return "badge-medium";
    case "Low":
      return "badge-low";
    default:
      return "badge-medium";
  }
}

function formatDate(isoString) {
  if (!isoString) return "Recently submitted";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Recently submitted";
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (e) {
    return "Recently submitted";
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderLoading() {
  requestsContainer.innerHTML = `
    <div class="empty-state">
      <div class="spinner"></div>
      <p>Loading campus requests...</p>
    </div>
  `;
}

function renderError(message) {
  requestsContainer.innerHTML = `
    <div class="empty-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <h3>Failed to Load</h3>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast-item toast-${type}`;

  let icon = "";
  if (type === "success") {
    icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === "error") {
    icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else {
    icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `${icon}<span>${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
