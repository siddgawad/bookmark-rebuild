const loginForm = document.getElementById("login-form");
const errorMsg = document.getElementById("error-message");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch("http://localhost:3000/api/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.message || "Login failed.";
      return;
    }

    localStorage.setItem("accessToken", data.token);
    window.location.href = "index.html";
  } catch (err) {
    console.error("Login error:", err);
    errorMsg.textContent = "An error occurred. Try again.";
  }
});