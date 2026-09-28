
const express = require("express");
const router = express.Router();

const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middleware/auth.middleware");
const { createProduct,getAllProducts,getProductById,updateProduct,deleteProduct } = require("../controllers/product.controller");
const upload = require("../middleware/upload.middleware");

function validateProduct(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  next();
}

const productValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number"),
];

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  productValidation,
  validateProduct,
  createProduct
);
router.get("/", authMiddleware, getAllProducts);
router.get("/:id", authMiddleware, getProductById);
router.put("/:id", authMiddleware, upload.single("image"), productValidation, validateProduct, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);
module.exports = router;