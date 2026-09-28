/**
 * product-form.js — shared logic for add-product.html and edit-product.html.
 *
 * Both endpoints (POST /api/products, PUT /api/products/:id) expect
 * multipart/form-data because an image file is uploaded via multer, so we
 * build a FormData object instead of JSON here (that's why api.js's
 * apiFetch supports an `isFormData` flag that skips the JSON.stringify /
 * Content-Type-application/json step — the browser sets the correct
 * multipart boundary header itself when we pass a FormData body).
 *
 * Validation errors come back from express-validator's raw
 * `errors.array()` shape here (the product routes don't remap them like
 * the auth routes do): [{ type, value, msg, path, location }, ...].
 */

const isEditMode = window.location.pathname.endsWith("edit-product.html");
const productId = new URLSearchParams(window.location.search).get("id");

renderNavbar("add");

const form = document.getElementById("productForm");
const submitBtn = document.getElementById("submitBtn");
const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");
const dropPlaceholder = document.getElementById("dropPlaceholder");
const dropzone = document.getElementById("dropzone");

function showFormAlert(message, type = "error") {
  const alertBox = document.getElementById("formAlert");
  alertBox.innerHTML = message
    ? `<div class="alert alert-${type}">${escapeHtml(message)}</div>`
    : "";
}

function clearFieldErrors() {
  form.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
  form.querySelectorAll("input.invalid, textarea.invalid").forEach((el) =>
    el.classList.remove("invalid")
  );
}

function applyValidationErrors(errors) {
  errors.forEach((err) => {
    const field = err.path || err.param;
    const message = err.msg || err.message;
    const errEl = document.getElementById(`err-${field}`);
    const inputEl = form.querySelector(`[name="${field}"]`);
    if (errEl) errEl.textContent = message;
    if (inputEl) inputEl.classList.add("invalid");
  });
}

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) {
    imagePreview.style.display = "none";
    dropPlaceholder.style.display = "flex";
    dropzone.classList.remove("has-image");
    return;
  }
  imagePreview.src = URL.createObjectURL(file);
  imagePreview.style.display = "block";
  dropPlaceholder.style.display = "none";
  dropzone.classList.add("has-image");
});

async function loadExistingProduct() {
  const { ok, data } = await apiFetch(`/api/products/${productId}`);
  if (!ok) {
    showFormAlert((data && data.message) || "Could not load product.");
    form.style.display = "none";
    return;
  }
  const p = data.product;
  form.title.value = p.title;
  form.description.value = p.description;
  form.price.value = p.price;
  imagePreview.src = p.imageUrl;
  imagePreview.style.display = "block";
  dropPlaceholder.style.display = "none";
}

async function init() {
  const authed = await requireAuth();
  if (!authed) return;

  if (isEditMode) {
    if (!productId) {
      showFormAlert("No product ID provided.");
      form.style.display = "none";
      return;
    }
    await loadExistingProduct();
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearFieldErrors();
  showFormAlert("");

  if (!isEditMode && !imageInput.files[0]) {
    document.getElementById("err-image").textContent = "Product image is required";
    imageInput.classList.add("invalid");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = isEditMode ? "Saving..." : "Creating...";

  const formData = new FormData();
  formData.append("title", form.title.value.trim());
  formData.append("description", form.description.value.trim());
  formData.append("price", form.price.value);
  if (imageInput.files[0]) {
    formData.append("image", imageInput.files[0]);
  }

  const url = isEditMode ? `/api/products/${productId}` : "/api/products";
  const method = isEditMode ? "PUT" : "POST";

  const { status, ok, data } = await apiFetch(url, {
    method,
    body: formData,
    isFormData: true,
  });

  submitBtn.disabled = false;
  submitBtn.textContent = isEditMode ? "Save changes" : "Create product";

  if (ok) {
    sessionStorage.setItem("flashMessage", isEditMode ? "Product updated" : "Product created");
    window.location.href = "index.html";
    return;
  }

  if (status === 400 && data && data.errors) {
    applyValidationErrors(data.errors);
  } else {
    showFormAlert((data && data.message) || "Something went wrong. Please try again.");
  }
});

init();
