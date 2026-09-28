/**
 * nav.js — fills in the shared navbar's auth-dependent bits, plus the
 * hamburger menu that takes over below 700px (all nav-links move inside it).
 * Every page includes: <div id="navbar"></div> then this script.
 */
const ICONS = {
  box: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 8v8a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.73l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M3.5 7 12 12l8.5-5M12 22V12" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  plus: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  menu: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
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

      <button class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false">
        ${ICONS.menu}
      </button>

      <div class="nav-links" id="navLinks">
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

      <div class="nav-backdrop" id="navBackdrop"></div>
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

  setupNavToggle();
}

function setupNavToggle() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  const backdrop = document.getElementById("navBackdrop");
  if (!toggle || !links) return;

  const closeMenu = () => {
    links.classList.remove("open");
    backdrop.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = ICONS.menu;
    document.body.classList.remove("nav-open-lock");
  };

  const openMenu = () => {
    links.classList.add("open");
    backdrop.classList.add("open");
    toggle.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.innerHTML = ICONS.close;
    document.body.classList.add("nav-open-lock");
  };

  toggle.addEventListener("click", () => {
    if (links.classList.contains("open")) closeMenu();
    else openMenu();
  });

  backdrop.addEventListener("click", closeMenu);

  // Close after picking a link, and whenever the viewport grows back past
  // the mobile breakpoint (e.g. rotating a tablet, resizing a window).
  links.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("click", () => {
      if (el.id !== "logoutBtn") closeMenu();
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 700) closeMenu();
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}