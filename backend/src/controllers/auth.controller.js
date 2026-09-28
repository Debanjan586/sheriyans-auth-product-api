const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} = require("../utils/token.utils");
const jwt = require("jsonwebtoken");

async function issueAuthTokens(user, res) {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Store only the hash of the refresh token
  user.refreshTokenHash = hashRefreshToken(refreshToken);
  await user.save();

  // Send the refresh token in a secure cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });

  return accessToken;
}

async function registerUser(req, res) {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const accessToken = await issueAuthTokens(user, res);

    return res.status(201).json({
      message: "User registered successfully",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const accessToken = await issueAuthTokens(user, res);

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function refreshUserToken(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token not found. Please log in again.",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await userModel.findById(decoded.userId);

    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({
        message: "Invalid refresh token. Please log in again.",
      });
    }

    const tokenHash = hashRefreshToken(refreshToken);

    if (tokenHash !== user.refreshTokenHash) {
      return res.status(401).json({
        message: "Refresh token has been revoked. Please log in again.",
      });
    }

    const accessToken = generateAccessToken(user._id);

    return res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        message: "Refresh token is invalid or expired. Please log in again.",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function logoutUser(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
        );

        await userModel.findByIdAndUpdate(decoded.userId, {
          $set: { refreshTokenHash: null },
        });
      } catch (error) {
        // The token may already be expired or invalid.
        // We still want to clear the cookie.
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}


async function getCurrentUser(req, res) {
  try {
    const user = await userModel
      .findById(req.user.userId)
      .select("-password -refreshTokenHash");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

module.exports = { registerUser, loginUser, refreshUserToken, logoutUser, getCurrentUser };
