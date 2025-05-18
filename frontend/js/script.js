const API_BASE = "https://bookmark-rebuild.onrender.com";
import {
  fetchBookmarks,
  createBookmark,
  deleteBookmark as deleteBookmarkAPI,
  updateBookmark
} from "./api.js";

let allBookmarks = [];
let currentView = "all";

const gridView = document.getElementById('bookmarkGrid');
const listView = document.getElementById('bookmarkList');
const viewToggles = document.querySelectorAll('.view-toggle');
const addBookmarkBtn = document.getElementById('addBookmarkBtn');
const addBookmarkModal = document.getElementById('addBookmarkModal');
const closeAddModal = document.getElementById('closeAddModal');
const cancelAddBookmark = document.getElementById('cancelAddBookmark');
const addBookmarkForm = document.getElementById('addBookmarkForm');
const exportBtn = document.getElementById('exportBtn');
const exportModal = document.getElementById('exportModal');
const closeExportModal = document.getElementById('closeExportModal');
const cancelExport = document.getElementById('cancelExport');
const confirmExport = document.getElementById('confirmExport');
const searchInput = document.querySelector('.search-input');
const menuItems = document.querySelectorAll('.menu-item');
const pageTitle = document.querySelector('.page-title');
const toast = document.getElementById('toast');

window.addEventListener("DOMContentLoaded", initBookmarks);

async function initBookmarks() {
  try {
    allBookmarks = await fetchBookmarks();
    renderCurrentView();
  } catch (err) {
    showToast("Could not load bookmarks.");
  }
}

function renderCurrentView() {
  const filtered = getFilteredBookmarks();
  renderGridView(filtered);
  renderListView(filtered);
}

function getFilteredBookmarks() {
  let filtered = [...allBookmarks];
  if (currentView === "favorites") {
    filtered = filtered.filter(b => b.favorite);
  }
  const search = searchInput.value.toLowerCase();
  if (search) {
    filtered = filtered.filter(b =>
      b.title.toLowerCase().includes(search) ||
      b.url.toLowerCase().includes(search) ||
      b.description.toLowerCase().includes(search) ||
      b.tags.some(tag => tag.toLowerCase().includes(search))
    );
  }
  return filtered;
}

function renderGridView(bookmarks) {
  gridView.innerHTML = '';
  bookmarks.forEach(bookmark => {
    const card = document.createElement('div');
    card.className = 'bookmark-card';
    card.innerHTML = `
      <div class="card-img" style="background-image: url('https://placehold.co/600x400');"></div>
      <div class="card-content">
        <h3 class="card-title">${bookmark.title}</h3>
        <div class="card-url">${bookmark.url}</div>
        <p class="card-description">${bookmark.description}</p>
        <div class="card-footer">
          <div class="card-tags">
            ${bookmark.tags.slice(0, 2).map(tag => `<span class="card-tag">${tag}</span>`).join('')}
            ${bookmark.tags.length > 2 ? `<span class="card-tag">+${bookmark.tags.length - 2}</span>` : ''}
          </div>
          <div class="card-date">${formatDate(bookmark.dateAdded)}</div>
        </div>
        <div class="card-actions">
          <button class="action-btn favorite-btn">${bookmark.favorite ? '⭐' : '☆'}</button>
          <button class="action-btn delete-btn red-btn">Delete</button>
        </div>
      </div>`;

    card.querySelector('.favorite-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      const updated = await updateBookmark(bookmark._id, { favorite: !bookmark.favorite });
      const index = allBookmarks.findIndex(b => b._id === bookmark._id);
      allBookmarks[index] = updated;
      renderCurrentView();
    });

    card.querySelector('.delete-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      await deleteBookmarkAPI(bookmark._id);
      allBookmarks = allBookmarks.filter(b => b._id !== bookmark._id);
      renderCurrentView();
    });

    card.addEventListener('click', () => window.open(bookmark.url, '_blank'));
    gridView.appendChild(card);
  });
}

function renderListView(bookmarks) {
  listView.innerHTML = '';
  bookmarks.forEach(bookmark => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <div class="list-thumbnail" style="background-image: url('https://placehold.co/600x400');"></div>
      <div class="list-content">
        <h3 class="list-title">${bookmark.title}</h3>
        <div class="list-url">${bookmark.url}</div>
        <div class="list-footer">
          <div class="list-tags">
            ${bookmark.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('')}
          </div>
          <div>${formatDate(bookmark.dateAdded)}</div>
        </div>
      </div>
      <div class="list-actions">
        <button class="action-btn favorite-btn">${bookmark.favorite ? '⭐' : '☆'}</button>
        <button class="action-btn delete-btn red-btn">Delete</button>
      </div>`;

    item.querySelector('.favorite-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      const updated = await updateBookmark(bookmark._id, { favorite: !bookmark.favorite });
      const index = allBookmarks.findIndex(b => b._id === bookmark._id);
      allBookmarks[index] = updated;
      renderCurrentView();
    });

    item.querySelector('.delete-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      await deleteBookmarkAPI(bookmark._id);
      allBookmarks = allBookmarks.filter(b => b._id !== bookmark._id);
      renderCurrentView();
    });

    item.addEventListener('click', () => window.open(bookmark.url, '_blank'));
    listView.appendChild(item);
  });
}

viewToggles.forEach(btn => {
  btn.addEventListener('click', () => {
    viewToggles.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const isGrid = btn.dataset.view === 'grid';
    gridView.classList.toggle('hidden', !isGrid);
    listView.classList.toggle('hidden', isGrid);
    renderCurrentView();
  });
});

searchInput.addEventListener('input', () => renderCurrentView());

menuItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    menuItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    currentView = item.getAttribute('data-page');
    pageTitle.textContent = item.textContent;
    renderCurrentView();
  });
});

addBookmarkBtn.addEventListener('click', () => addBookmarkModal.classList.add('active'));
closeAddModal.addEventListener('click', () => addBookmarkModal.classList.remove('active'));
cancelAddBookmark.addEventListener('click', () => addBookmarkModal.classList.remove('active'));

addBookmarkForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = document.getElementById('bookmarkUrl').value;
  const title = document.getElementById('bookmarkTitle').value;
  const description = document.getElementById('bookmarkDescription').value;
  const tagsInput = document.getElementById('bookmarkTags').value;
  const tags = tagsInput.split(',').map(t => t.trim());

  const created = await createBookmark({ title, url, description, tags });
  allBookmarks.unshift(created);
  renderCurrentView();
  showToast("Bookmark added!");
  addBookmarkModal.classList.remove('active');
  addBookmarkForm.reset();
});

confirmExport.addEventListener('click', () => {
  const format = document.getElementById('exportFormat').value;
  const scope = document.querySelector('input[name="exportScope"]:checked').value;
  const bookmarksToExport = scope === 'selected' ? allBookmarks.filter(b => b.favorite) : allBookmarks;
  exportBookmarks(bookmarksToExport, format);
  exportModal.classList.remove('active');
});

exportBtn.addEventListener('click', () => exportModal.classList.add('active'));
closeExportModal.addEventListener('click', () => exportModal.classList.remove('active'));
cancelExport.addEventListener('click', () => exportModal.classList.remove('active'));

function exportBookmarks(data, format) {
  let content = '', type = '', filename = `bookmarks_${Date.now()}`;
  if (format === 'json') {
    content = JSON.stringify(data, null, 2);
    type = 'application/json';
    filename += '.json';
  } else if (format === 'csv') {
    content = 'Title,URL,Description,Tags,Date Added\n';
    content += data.map(b => `"${b.title}","${b.url}","${b.description}","${b.tags.join(',')}","${b.dateAdded}"`).join('\n');
    type = 'text/csv';
    filename += '.csv';
  } else if (format === 'html') {
    content = `<!DOCTYPE html><html><body><ul>` +
      data.map(b => `<li><a href="${b.url}">${b.title}</a> - ${b.description}</li>`).join('') +
      `</ul></body></html>`;
    type = 'text/html';
    filename += '.html';
  }
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Exported as " + format.toUpperCase());
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.ceil((now - date) / (1000 * 60 * 60 * 24));
  if (diff <= 1) return 'Today';
  if (diff === 2) return 'Yesterday';
  if (diff <= 7) return `${diff} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  try {
    await fetch(`${API_BASE}/user/logout`, {
      method: "POST",
      credentials: "include"
    });
    localStorage.removeItem("accessToken");
    window.location.href = "login.html";
  } catch (err) {
    console.error("Logout failed:", err);
  }
});
