# Authentication & Product CRUD API

A full-stack web application built as part of the **Cohort 3.0** assignment. It provides user authentication and protected product management, including image uploads.

## 🔗 Project Links

* **Live Website:** https://sheriyans-auth-product-api.onrender.com
* **GitHub Repository:** https://github.com/Debanjan586/sheriyans-auth-product-api

## ✨ Features

### Authentication

* User registration and login
* JWT access and refresh tokens
* Refresh-token endpoint
* Protected user profile endpoint
* Logout functionality

### Product Management

* Create, read, update, and delete products
* Protected product routes
* Product image uploads using Cloudinary
* Product data stored in MongoDB Atlas

### Frontend

* Registration and login pages
* Product listing
* Add and edit product forms
* Consistent, responsive interface

## 🛠️ Tech Stack

**Frontend:** HTML, CSS, JavaScript

**Backend:** Node.js, Express.js

**Database:** MongoDB Atlas, Mongoose

**Authentication:** JSON Web Tokens (JWT), cookie-parser

**Validation:** express-validator

**Image Hosting:** Cloudinary

**Deployment:** Render

## 📁 Project Structure

```text
sheriyans-assignment/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── config/
│       ├── controllers/
│       ├── db/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── utils/
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── add-product.html
│   ├── edit-product.html
│   ├── css/
│   └── js/
└── README.md
```

## 🚀 Run Locally

### Prerequisites

* Node.js and npm
* A MongoDB Atlas account or accessible MongoDB database
* A Cloudinary account

### 1. Clone the repository

```bash
git clone https://github.com/Debanjan586/sheriyans-auth-product-api.git
cd sheriyans-auth-product-api
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `backend/` directory:

```env
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

Replace the placeholder values with your own credentials. Never commit your `.env` file or expose your secrets publicly.

### 4. Start the server

```bash
node server.js
```

Open http://localhost:7930 in your browser.

## 📡 API Endpoints

### Authentication

| Method | Endpoint                  | Description                            |
| ------ | ------------------------- | -------------------------------------- |
| POST   | `/api/auth/register`      | Register a user                        |
| POST   | `/api/auth/login`         | Log in                                 |
| POST   | `/api/auth/refresh-token` | Refresh access token                   |
| POST   | `/api/auth/logout`        | Log out (protected)                    |
| GET    | `/api/auth/me`            | Get the authenticated user (protected) |

### Products

| Method | Endpoint            | Description                  |
| ------ | ------------------- | ---------------------------- |
| GET    | `/api/products`     | Retrieve products            |
| POST   | `/api/products`     | Create a product (protected) |
| GET    | `/api/products/:id` | Retrieve a product by ID     |
| PUT    | `/api/products/:id` | Update a product (protected) |
| DELETE | `/api/products/:id` | Delete a product (protected) |

Protected endpoints require valid authentication. Product image uploads use the `image` multipart form field.

## 🔒 Security

* Secrets are stored in environment variables.
* Protected routes require authentication.
* MongoDB Atlas network access is restricted to configured IP ranges.
* User passwords and authentication credentials should never be shared or committed to Git.

## 👨‍💻 Author

**Debanjan Sadhukhan**

GitHub: [@Debanjan586](https://github.com/Debanjan586)
