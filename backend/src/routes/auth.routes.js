const express = require("express");
const router = express.Router();

const { body, validationResult } = require("express-validator");
const { registerUser,loginUser,refreshUserToken,logoutUser,getCurrentUser } = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Please confirm your password")
    .bail()
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array().map(({ path, msg }) => ({
          field: path,
          message: msg,
        })),
      });
    }

    next();
  },
];


const validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array().map(({ path, msg }) => ({
          field: path,
          message: msg,
        })),
      });
    }

    next();
  },
];

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/refresh-token", refreshUserToken);
router.post("/logout", authMiddleware, logoutUser);
router.get("/me", authMiddleware, getCurrentUser);
module.exports = router;