import { fetchBookmarks, createBookmark, updateBookmark, deleteBookmark } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const lists = document.querySelectorAll(".card-list");

  async function loadAndRender() {
    const bookmarks = await fetchBookmarks();
    lists.forEach(list => list.innerHTML = ""); // clear previous
    bookmarks.forEach(renderCard);
  }

  function renderCard(bkmrk) {
    const card = document.createElement("div");
    card.className = "card";
    card.draggable = true;
    card.dataset.id = bkmrk._id;
    card.textContent = bkmrk.title;
    card.addEventListener("dragstart", () => card.classList.add("dragging"));
    card.addEventListener("dragend", async () => {
      card.classList.remove("dragging");
      const parentStatus = card.parentElement.id;
      await updateBookmark(bkmrk._id, { category: parentStatus });
      loadAndRender();
    });
    document.getElementById(bkmrk.category).appendChild(card);
  }

  document.getElementById("addBookmarkBtn").addEventListener("click", async () => {
    const title = prompt("Enter bookmark title:");
    const url = prompt("Enter bookmark URL:");
    if (!title || !url) return alert("Both fields are required.");
    await createBookmark({ title, url, category: "todo", bkmrkFolder: "General", tags: ["web"] });
    loadAndRender();
  });

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await fetch("http://localhost:3000/api/user/logout", { method: "POST", credentials: "include" });
    localStorage.removeItem("accessToken");
    window.location.href = "login.html";
  });

  loadAndRender();
});