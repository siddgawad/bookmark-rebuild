const API_BASE = "https://bookmark-rebuild.onrender.com/api";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const submitBtn = e.target.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.classList.add("loading");

  try {
    const res = await fetch(`${API_BASE}/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // important for refresh cookie
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    localStorage.setItem("accessToken", data.token);
    window.location.href = "/frontend/index.html"; // Adjust path if needed

  } catch (err) {
    showToast(err.message || "Error logging in");
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove("loading");
  }
});

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}
