const API_BASE = "http://localhost:3000/api";

// Attach access token to all requests
function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : ""
  };
}

async function handleError(res, defaultMessage) {
  if (!res.ok) {
    // Try to get error message from response
    try {
      const errorData = await res.json();
      throw new Error(errorData.message || defaultMessage);
    } catch (e) {
      throw new Error(defaultMessage || res.statusText);
    }
  }
}

async function handleTokenRefresh(originalRequestFn, ...args) {
  try {
    // Try to refresh token
    const refreshRes = await fetch(`${API_BASE}/user/refresh`, {
      method: "POST",
      credentials: "include"
    });
    
    if (!refreshRes.ok) {
      // If refresh fails, redirect to login
      localStorage.removeItem("accessToken");
      window.location.href = "login.html";
      return;
    }
    
    // Get new token and store it
    const refreshData = await refreshRes.json();
    localStorage.setItem("accessToken", refreshData.token);
    
    // Retry original request
    return await originalRequestFn(...args);
  } catch (err) {
    console.error("Token refresh failed:", err);
    localStorage.removeItem("accessToken");
    window.location.href = "login.html";
  }
}

export async function fetchBookmarks() {
  try {
    const res = await fetch(`${API_BASE}/bookmark`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    
    if (res.status === 401) {
      return await handleTokenRefresh(fetchBookmarks);
    }
    
    await handleError(res, "Failed to fetch bookmarks");
    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err);
    throw err;
  }
}

export async function createBookmark(data) {
  try {
    const res = await fetch(`${API_BASE}/bookmark`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(data),
    });
    
    if (res.status === 401) {
      return await handleTokenRefresh(createBookmark, data);
    }
    
    await handleError(res, "Failed to create bookmark");
    return await res.json();
  } catch (err) {
    console.error("Create error:", err);
    throw err;
  }
}


export async function deleteBookmark(id) {
  try {
    const res = await fetch(`${API_BASE}/bookmark/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    
    if (res.status === 401) {
      return await handleTokenRefresh(deleteBookmark, id);
    }
    
    await handleError(res, "Failed to delete bookmark");
    return await res.json();
  } catch (err) {
    console.error("Delete error:", err);
    throw err;
  }
}

export async function updateBookmark(id, data) {
  try {
    const res = await fetch(`${API_BASE}/bookmark/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (res.status === 401) {
      return await handleTokenRefresh(updateBookmark, id, data);
    }

    await handleError(res, "Failed to update bookmark");
    return await res.json();
  } catch (err) {
    console.error("Update error:", err);
    throw err;
  }
}
