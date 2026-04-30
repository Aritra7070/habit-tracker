import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Habit from "../models/Habit.js";
import Note from "../models/Note.js";
import PushSubscription from "../models/PushSubscription.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import { validateName, validateEmail, validatePassword } from "../utils/validate.js";
import { requireAuth } from "../middleware/auth.middleware.js";

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

// PUT /api/auth/focus-off-mode
router.put("/focus-off-mode", requireAuth, async (req, res) => {
  try {
    const { enabled, startDate, endDate } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.focusOffMode = {
      enabled: !!enabled,
      startDate: enabled ? new Date(startDate) : null,
      endDate: enabled ? new Date(endDate) : null,
    };

    await user.save();

    res.json({
      message: "Focus off mode updated successfully",
      focusOffMode: user.focusOffMode,
    });
  } catch (err) {
    console.error("Focus off mode update error:", err);
    res.status(500).json({ error: "Server error updating focus off mode" });
  }
});

// DELETE /api/auth/account
router.delete("/account", requireAuth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required to delete account" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify password before deletion
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const userId = user._id;

    // Delete all user data
    await Promise.all([
      Habit.deleteMany({ userId }),
      Note.deleteMany({ userId }),
      PushSubscription.deleteMany({ userId }),
      PasswordResetToken.deleteMany({ userId }),
      User.deleteOne({ _id: userId }),
    ]);

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Account deletion error:", err);
    res.status(500).json({ error: "Server error deleting account" });
  }
});

export default router;
