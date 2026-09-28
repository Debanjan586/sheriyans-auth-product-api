/**
 * products.js — product listing page (index.html).
 *
 * Note: the backend currently requires a valid access token for
 * GET /api/products and GET /api/products/:id even though the assignment
 * spec marks those routes "Public". We follow what the backend actually
 * enforces, so this page requires login like the rest of the app — see
 * the README for details on this mismatch.
 */

renderNavbar("products");

const grid = document.getElementById("productGrid");
const alertBox = document.getElementById("alertBox");
const addBtn = document.getElementById("addBtn");

const TRASH_ICON =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-.8 12.1A2 2 0 0 1 16.2 21H7.8a2 2 0 0 1-2-1.9L5 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const EDIT_ICON =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function money(value) {
  const num = Number(value);
  return `₹${num.toFixed(2)}`;
}

function showAlert(message, type = "error") {
  alertBox.innerHTML = message
    ? `<div class="alert alert-${type}">${escapeHtml(message)}</div>`
    : "";
}

function renderSkeleton(count = 6) {
  grid.innerHTML = Array.from({ length: count })
    .map(
      () => `
      <div class="skeleton-card">
        <div class="thumb skeleton-block"></div>
        <div class="lines">
          <div class="line skeleton-block w-60"></div>
          <div class="line skeleton-block w-90"></div>
          <div class="line skeleton-block w-40"></div>
        </div>
      </div>
    `
    )
    .join("");
}

function renderEmptyState() {
  grid.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M21 8v8a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.73l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8Z" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 7 12 12l8.5-5" stroke="currentColor" stroke-width="1.7"/></svg>
      </div>
      <h3>No products yet</h3>
      <p>Add your first product to see it listed here.</p>
      <a href="add-product.html" class="btn btn-primary">Add a product</a>
    </div>
  `;
}

function renderProducts(products) {
  if (products.length === 0) {
    renderEmptyState();
    return;
  }

  grid.innerHTML = products
    .map(
      (p, i) => `
      <div class="product-card" data-id="${p._id}" style="animation-delay:${Math.min(i, 8) * 40}ms">
        <div class="thumb">
          <img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.title)}" loading="lazy" />
          <span class="price-badge">${money(p.price)}</span>
        </div>
        <div class="body">
          <div class="title">${escapeHtml(p.title)}</div>
          <div class="desc">${escapeHtml(p.description)}</div>
        </div>
        <div class="actions">
          <a class="btn btn-ghost btn-small" href="edit-product.html?id=${p._id}">${EDIT_ICON} Edit</a>
          <button class="btn btn-danger btn-small delete-btn" data-id="${p._id}">${TRASH_ICON} Delete</button>
        </div>
      </div>
    `
    )
    .join("");

  grid.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => handleDelete(btn.dataset.id, btn));
  });
}

async function handleDelete(id, btn) {
  if (!confirm("Delete this product? This cannot be undone.")) return;

  btn.disabled = true;
  btn.textContent = "Deleting...";

  const { ok, data } = await apiFetch(`/api/products/${id}`, { method: "DELETE" });

  if (ok) {
    const card = document.querySelector(`.product-card[data-id="${id}"]`);
    if (card) card.remove();
    showToast("Product deleted", "success");
    if (grid.children.length === 0) renderEmptyState();
  } else {
    showToast((data && data.message) || "Could not delete product.", "error");
    btn.disabled = false;
    btn.innerHTML = `${TRASH_ICON} Delete`;
  }
}

function showFlashIfAny() {
  const msg = sessionStorage.getItem("flashMessage");
  if (msg) {
    sessionStorage.removeItem("flashMessage");
    showToast(msg, "success");
  }
}

async function loadProducts() {
  renderSkeleton();
  showFlashIfAny();

  const authed = await requireAuth();
  if (!authed) return;

  addBtn.style.display = "inline-flex";

  const { ok, data } = await apiFetch("/api/products");

  if (!ok) {
    grid.innerHTML = "";
    showAlert((data && data.message) || "Could not load products.");
    return;
  }

  renderProducts(data.products || []);
}

loadProducts();
