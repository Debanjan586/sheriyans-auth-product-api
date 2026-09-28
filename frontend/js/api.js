/**
 * api.js — single place that talks to the backend.
 *
 * Why this file exists:
 * The backend issues a short-lived Access Token (15 min, JWT) that we must
 * send on every protected request in the "Authorization: Bearer <token>"
 * header, and a long-lived Refresh Token (7 days) that the backend sets
 * itself as an httpOnly cookie — JS can never read it, only the browser
 * sends it automatically when we call fetch with credentials: "include".
 *
 * Flow:
 *  1. login/register -> backend returns { accessToken, user } in the JSON
 *     body + sets the refreshToken cookie. We keep accessToken in memory
 *     (a plain JS variable) and mirror it into sessionStorage so a page
 *     refresh doesn't instantly log the user out.
 *  2. Every request goes through apiFetch(), which attaches the header.
 *  3. If a request comes back 401 (access token expired), we call
 *     /api/auth/refresh-token ONCE, which reads the refreshToken cookie
 *     server-side and hands back a new access token. We retry the
 *     original request with the new token.
 *  4. If the refresh itself fails, the refresh token is dead/expired ->
 *     we clear state and send the user to login.html.
 */

// Points at the backend from server.js (app.listen(7930, ...)).
// Change this to your deployed backend URL when you go live, or to ""
// if you ever serve this frontend from the same origin as the API.
const API_BASE_URL = "";

const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "authUser";

let accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY) || null;

function setSession(token, user) {
  accessToken = token;
  if (token) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }
  if (user) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(USER_KEY);
  }
}

function getCurrentUserFromSession() {
  const raw = sessionStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function isLoggedIn() {
  return Boolean(accessToken);
}

/**
 * Low-level request helper. Does NOT auto-refresh — apiFetch() wraps this
 * and adds the retry-on-401 behaviour.
 */
async function rawRequest(path, { method = "GET", body, isFormData = false } = {}) {
  const headers = {};

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  if (body && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    credentials: "include", // needed so the refreshToken cookie is sent/received
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    // some responses (e.g. 204) may have no body
  }

  return { status: response.status, ok: response.ok, data };
}

/**
 * Tries to get a fresh access token using the httpOnly refresh cookie.
 * Returns the new token, or null if refresh failed.
 */
async function tryRefreshAccessToken() {
  const result = await rawRequest("/api/auth/refresh-token", { method: "POST" });
  if (result.ok && result.data && result.data.accessToken) {
    accessToken = result.data.accessToken;
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    return accessToken;
  }
  return null;
}

/**
 * Main function every page/page-script should use to call the API.
 * Automatically retries once after a silent refresh if the first call
 * comes back 401 (expired/missing access token).
 */
async function apiFetch(path, options = {}) {
  let result = await rawRequest(path, options);

  if (result.status === 401 && path !== "/api/auth/refresh-token") {
    const refreshed = await tryRefreshAccessToken();
    if (refreshed) {
      result = await rawRequest(path, options);
    } else {
      setSession(null, null);
      redirectToLogin();
    }
  }

  return result;
}

function redirectToLogin() {
  const here = encodeURIComponent(window.location.pathname);
  if (!window.location.pathname.endsWith("login.html")) {
    window.location.href = `login.html?next=${here}`;
  }
}

/** Call this once on every protected page before doing anything else. */
async function requireAuth() {
  if (accessToken) return true;

  // No token in memory (e.g. fresh tab) — try silent refresh via cookie
  // before giving up, so a page reload doesn't force a re-login every time.
  const refreshed = await tryRefreshAccessToken();
  if (refreshed) return true;

  redirectToLogin();
  return false;
}

async function logout() {
  await apiFetch("/api/auth/logout", { method: "POST" });
  setSession(null, null);
  window.location.href = "login.html";
}
