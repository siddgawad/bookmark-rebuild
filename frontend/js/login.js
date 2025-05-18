const API_BASE = "https://bookmark-rebuild.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (!loginForm) {
    console.error("❌ login-form not found");
    return;
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const submitBtn = e.target.querySelector("button[type='submit']");

    submitBtn.disabled = true;
    submitBtn.classList.add("loading");

    try {
      const res = await fetch(`${API_BASE}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }), // ✅ matches backend
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("accessToken", data.token);

      // ✅ Update this path based on your Vercel deployment
      window.location.href = "/index.html";

    } catch (err) {
      console.error("❌ Login Error:", err);
      showToast(err.message || "Login error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove("loading");
    }
  });
});

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) {
    alert(message); // fallback
    return;
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}
