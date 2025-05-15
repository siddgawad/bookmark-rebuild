const API_BASE = "http://localhost:3000/api";

// Attach access token to all requests
function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : ""
  };
}

function handleError(res, defaultMessage) {
  if (!res.ok) throw new Error(defaultMessage || res.statusText);
}

export async function fetchBookmarks() {
  const res = await fetch(`${API_BASE}/bookmark`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  handleError(res, "Failed to fetch bookmarks");
  return await res.json();
}

export async function createBookmark(data) {
  const res = await fetch(`${API_BASE}/bookmark`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });
  handleError(res, "Failed to create bookmark");
  return await res.json();
}

export async function updateBookmark(id, data) {
  const res = await fetch(`${API_BASE}/bookmark/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });
  handleError(res, "Failed to update bookmark");
  return await res.json();
}

export async function deleteBookmark(id) {
  const res = await fetch(`${API_BASE}/bookmark/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  handleError(res, "Failed to delete bookmark");
  return await res.json();
}