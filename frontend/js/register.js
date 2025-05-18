const API_BASE = "https://bookmark-rebuild.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form");
  if (!registerForm) {
    console.error("❌ register-form not found");
    return;
  }

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const submitBtn = e.target.querySelector("button[type='submit']");

    submitBtn.disabled = true;
    submitBtn.classList.add("loading");

    try {
      const res = await fetch(`${API_BASE}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Registration failed");

      localStorage.setItem("accessToken", data.token);

      // ✅ Adjust path depending on final hosting
      window.location.href = "/index.html";

    } catch (err) {
      console.error("❌ Register error:", err);
      showToast(err.message || "Registration error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove("loading");
    }
  });
});

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) {
    alert(message);
    return;
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}
