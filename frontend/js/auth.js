/**
 * auth.js — logic for login.html and register.html.
 * Both forms POST JSON to the backend, which validates with express-validator
 * and (on failure) returns:
 *   { message: "Validation failed", errors: [{ field, message }, ...] }
 * We map those straight onto the matching <div class="field-error" id="err-<field>">.
 */

renderNavbar(document.getElementById("loginForm") ? "login" : "register");

function clearFieldErrors(form) {
  form.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
  form.querySelectorAll("input.invalid").forEach((el) => el.classList.remove("invalid"));
}

function showFormAlert(message, type = "error") {
  const alertBox = document.getElementById("formAlert");
  if (!alertBox) return;
  alertBox.innerHTML = message
    ? `<div class="alert alert-${type}">${escapeHtml(message)}</div>`
    : "";
}

function applyFieldErrors(form, errors) {
  errors.forEach(({ field, message }) => {
    const errEl = document.getElementById(`err-${field}`);
    const inputEl = form.querySelector(`[name="${field}"]`);
    if (errEl) errEl.textContent = message;
    if (inputEl) inputEl.classList.add("invalid");
  });
}

function getRedirectTarget() {
  const params = new URLSearchParams(window.location.search);
  return params.get("next") || "index.html";
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors(loginForm);
    showFormAlert("");

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    const payload = {
      email: loginForm.email.value.trim(),
      password: loginForm.password.value,
    };

    const { status, ok, data } = await apiFetch("/api/auth/login", {
      method: "POST",
      body: payload,
    });

    submitBtn.disabled = false;
    submitBtn.textContent = "Log in";

    if (ok) {
      setSession(data.accessToken, data.user);
      window.location.href = getRedirectTarget();
      return;
    }

    if (status === 400 && data && data.errors) {
      applyFieldErrors(loginForm, data.errors);
    } else {
      showFormAlert((data && data.message) || "Something went wrong. Please try again.");
    }
  });
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors(registerForm);
    showFormAlert("");

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    const payload = {
      name: registerForm.name.value.trim(),
      email: registerForm.email.value.trim(),
      password: registerForm.password.value,
      confirmPassword: registerForm.confirmPassword.value,
    };

    const { status, ok, data } = await apiFetch("/api/auth/register", {
      method: "POST",
      body: payload,
    });

    submitBtn.disabled = false;
    submitBtn.textContent = "Create account";

    if (ok) {
      // Register does NOT return tokens (by design, per the spec) — so we
      // send the user to log in with their new credentials.
      showFormAlert("Account created. Please log in.", "success");
      setTimeout(() => (window.location.href = "login.html"), 900);
      return;
    }

    if (status === 400 && data && data.errors) {
      applyFieldErrors(registerForm, data.errors);
    } else if (status === 409) {
      showFormAlert((data && data.message) || "Email already registered.");
    } else {
      showFormAlert((data && data.message) || "Something went wrong. Please try again.");
    }
  });
}
