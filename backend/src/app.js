const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");

const app = express();

app.use(express.json());
app.use(cookieParser());

// Serve frontend HTML, CSS, and JavaScript
app.use(express.static(path.resolve(__dirname, "../../frontend")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

module.exports = app;