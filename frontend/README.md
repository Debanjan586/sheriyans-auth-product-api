# Frontend — Auth + Product CRUD

Plain HTML/CSS/JS frontend for the backend in `backend copy/`. No build step,
no framework — open the files or serve them with any static server.

## Pages

| File               | Purpose                                   | Auth required |
|--------------------|--------------------------------------------|----------------|
| `login.html`       | Log in                                     | no |
| `register.html`    | Create an account                          | no |
| `index.html`       | List products, delete, link to edit/add    | yes (see note below) |
| `add-product.html` | Create a product (title, desc, price, image) | yes |
| `edit-product.html?id=<id>` | Edit an existing product           | yes |

## How the auth flow works (js/api.js)

- Login/register returns `{ accessToken, user }` in the JSON body. We keep
  `accessToken` in a JS variable + `sessionStorage` (so a refresh doesn't
  immediately log you out, but closing the tab does — access tokens are
  short-lived by design).
- The refresh token is an **httpOnly cookie** set by the backend — JS never
  touches it directly. Every `fetch` call uses `credentials: "include"` so
  the browser sends/receives it automatically.
- `apiFetch()` wraps every request: if a call comes back `401`, it silently
  calls `POST /api/auth/refresh-token` once to get a new access token and
  retries. If that also fails, it clears local state and redirects to
  `login.html`.
- `requireAuth()` runs at the top of every protected page — it first checks
  for an in-memory token, and if there isn't one (e.g. you reloaded the tab),
  it tries a silent refresh via the cookie before bouncing to login.

## Things I found in the backend while checking it against the spec

I didn't change any backend code (you said it's done), but these are worth
fixing before you submit, because they affect whether the frontend can work
at all in some setups:

1. **No CORS is configured.** `cors` is in `package.json` but `app.js` never
   calls `app.use(cors(...))`. If you ever serve the frontend from a
   different origin than the API (different port locally, or a separate
   deployment like Vercel + Render), the browser will block every request —
   including the cookie-based refresh flow, which additionally needs
   `credentials: true` on the CORS config to work at all. One-line fix in
   `src/app.js`:
   ```js
   const cors = require("cors");
   app.use(cors({ origin: "http://your-frontend-origin", credentials: true }));
   ```
2. **`GET /api/products` and `GET /api/products/:id` are wired behind
   `authMiddleware`** in `product.routes.js`, even though the task sheet
   marks both `Public`. Right now nobody can browse products without logging
   in first. The frontend follows what the backend actually enforces (so
   `index.html` requires login too) — if you want anonymous browsing to
   match the spec, drop `authMiddleware` from those two routes.
3. Minor: `registerUser` currently issues and returns an `accessToken` +
   sets the refresh cookie, even though the task sheet says "do not return
   tokens on register." The frontend ignores the token it gets back and
   sends the user to `login.html` regardless, so this doesn't break
   anything — just flagging the mismatch in case it's graded against the
   spec text.

None of the above stops it from working locally against `localhost:7930`
right now (same-machine cookie + no strict CORS check applies to same-origin
requests only when you open the frontend via `file://` or a dev server on
the same host) — but you'll hit #1 the moment frontend and backend are on
different hosts, which is exactly what "Project Live Link" deployment means.
Fix that before deploying.

## Config

`js/api.js` has one line to change per environment:
```js
const API_BASE_URL = "http://localhost:7930";
```
Point it at your deployed backend URL when you deploy the frontend.

## Running locally

1. Start the backend: `cd "backend copy" && npm install && npm run dev` (or
   `node server.js`) — it listens on port 7930.
2. Serve the frontend as static files, e.g. `npx serve frontend` or the
   VS Code "Live Server" extension, and open `login.html`.
3. Register a user, log in, then add/edit/delete products.
