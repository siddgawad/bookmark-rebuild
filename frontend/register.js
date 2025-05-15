// frontend/register.js
const form = document.getElementById("register-form");
const errorMsg = document.getElementById("error-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch("http://localhost:3000/api/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // needed for cookies
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.message || "Registration failed.";
      return;
    }

    alert("Account created successfully!");
    window.location.href = "login.html";
  } catch (err) {
    console.error("Register error:", err);
    errorMsg.textContent = "An error occurred. Try again.";
  }
});
