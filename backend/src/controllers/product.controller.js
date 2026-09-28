
const Product = require("../models/product.model");
const cloudinary = require("../config/cloudinary");

// Upload an image buffer to Cloudinary and return the upload result.
function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "sheriyans-products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

async function createProduct(req, res) {
  try {
    const { title, description, price } = req.body;

    // Require an image when creating a product.
    if (!req.file) {
      return res.status(400).json({
        message: "Product image is required",
      });
    }

    // Upload the image to Cloudinary.
    const uploadResult = await uploadToCloudinary(req.file.buffer);

    // Save the product and its Cloudinary image URL in MongoDB.
    const product = await Product.create({
      title,
      description,
      price,
      imageUrl: uploadResult.secure_url,
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid product data",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function getAllProducts(req, res) {
  try {
    const products = await Product.find();

    return res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({ product });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { title, description, price } = req.body;

    // Find the existing product first.
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Update the text and price fields.
    product.title = title;
    product.description = description;
    product.price = price;

    // Replace the image only if a new one was uploaded.
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      product.imageUrl = uploadResult.secure_url;
    }

    await product.save();

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid product data",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
      product,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};