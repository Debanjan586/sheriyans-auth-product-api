/**
 * nav.js — fills in the shared navbar's auth-dependent bits.
 * Every page includes: <div id="navbar"></div> then this script.
 */
const ICONS = {
  box: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 8v8a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.73l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M3.5 7 12 12l8.5-5M12 22V12" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  plus: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
};

function renderNavbar(activePage = "") {
  const container = document.getElementById("navbar");
  if (!container) return;

  const user = getCurrentUserFromSession();
  const loggedIn = isLoggedIn() || Boolean(user);
  const initial = user && user.name ? user.name.trim().charAt(0).toUpperCase() : "?";

  container.innerHTML = `
    <nav class="navbar">
      <a class="brand" href="index.html">
        <span class="brand-mark">${ICONS.box}</span>
        ShopAPI
      </a>
      <div class="nav-links">
        <a href="index.html" class="${activePage === "products" ? "active" : ""}">Products</a>
        ${
          loggedIn
            ? `<a href="add-product.html" class="${activePage === "add" ? "active" : ""}">${ICONS.plus} Add Product</a>
               <span class="nav-divider"></span>
               <span class="nav-user"><span class="avatar">${escapeHtml(initial)}</span><span class="label">${user ? escapeHtml(user.name) : "Account"}</span></span>
               <button id="logoutBtn" class="btn btn-ghost btn-small">Logout</button>`
            : `<a href="login.html" class="${activePage === "login" ? "active" : ""}">Login</a>
               <a href="register.html" class="btn btn-primary btn-small">Register</a>`
        }
      </div>
    </nav>
  `;

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      logoutBtn.disabled = true;
      logoutBtn.textContent = "Logging out...";
      await logout();
    });
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
