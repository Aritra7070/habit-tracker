import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { validateName, validateEmail, validatePassword } from "../utils/validate.js";

const router = Router();
const TOKEN_EXPIRY = "7d";

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const nameCheck = validateName(name);
    if (!nameCheck.valid) {
      return res.status(400).json({ error: nameCheck.message });
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ error: emailCheck.message });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.message });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: "Email is already registered" });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// POST /api/auth/signin
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ error: emailCheck.message });
    }

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ error: "Server error during signin" });
  }
});

// POST /api/auth/google-signin
router.post("/google-signin", async (req, res) => {
  try {
    const { googleToken } = req.body;
    console.log("[Google Auth] Received google token, verifying...");

    if (!googleToken) {
      console.error("[Google Auth] No token provided");
      return res.status(400).json({ error: "Google token is required" });
    }

    // Use the access token to get user info from Google
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${googleToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      const errorData = await userInfoResponse.json();
      console.error("[Google Auth] Failed to get user info:", errorData);
      return res.status(401).json({ error: "Invalid Google token" });
    }

    const googleUser = await userInfoResponse.json();
    console.log("[Google Auth] Retrieved user info:", { email: googleUser.email, name: googleUser.name });
    const { email, name, picture, id: googleId } = googleUser;

    if (!email) {
      console.error("[Google Auth] No email in Google user data");
      return res.status(400).json({ error: "Unable to retrieve email from Google" });
    }

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log("[Google Auth] Creating new user:", email);
      // Create a new user with Google info
      user = await User.create({
        name: name || "Google User",
        email: email.toLowerCase(),
        googleId: googleId,
        // Generate a random password for Google users (they won't use it)
        password: Math.random().toString(36).substring(2, 15),
        picture: picture,
      });
    } else {
      console.log("[Google Auth] Found existing user:", email);
      if (!user.googleId) {
        // Link Google account to existing user
        user.googleId = googleId;
        if (picture && !user.picture) {
          user.picture = picture;
        }
        await user.save();
      }
    }

    const token = signToken(user._id);
    console.log("[Google Auth] Authentication successful for:", user.email);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("[Google Auth] Error:", err.message);
    res.status(401).json({ error: "Google authentication failed" });
  }
});

export default router;
