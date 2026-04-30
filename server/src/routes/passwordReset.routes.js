import { Router } from "express";
import User from "../models/User.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
import { validateEmail, validatePassword } from "../utils/validate.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

function devResetPayload(delivery) {
  const shouldExposeResetLink =
    process.env.EXPOSE_RESET_LINK === "true" &&
    process.env.NODE_ENV !== "production";

  if (!shouldExposeResetLink) {
    return {};
  }

  return {
    emailSent: Boolean(delivery?.sent),
    resetUrl: delivery?.resetUrl,
  };
}

/**
 * POST /api/auth/forgot-password
 * Public — user provides their email (from the sign-in page).
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ error: emailCheck.message });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond 200 so that attackers can't enumerate emails
    if (!user) {
      return res.json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    const token = await PasswordResetToken.createToken(user._id);
    const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;

    const delivery = await sendPasswordResetEmail(user.email, resetUrl);
    delivery.resetUrl = resetUrl;

    res.json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
      ...devResetPayload(delivery),
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Server error while processing request" });
  }
});

/**
 * POST /api/auth/request-password-reset
 * Protected — for logged-in users from the Settings page.
 * Uses the JWT to look up the user's email automatically.
 */
router.post("/request-password-reset", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const token = await PasswordResetToken.createToken(user._id);
    const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;

    const delivery = await sendPasswordResetEmail(user.email, resetUrl);
    delivery.resetUrl = resetUrl;

    res.json({
      message: "Password reset link has been sent to your email.",
      ...devResetPayload(delivery),
      // Send a masked version of the email for the UI notification
      email: user.email.replace(
        /(.{2})(.*)(@.*)/,
        (_, a, b, c) => a + "*".repeat(b.length) + c
      ),
    });
  } catch (err) {
    console.error("Request password reset error:", err);
    res.status(500).json({ error: "Server error while processing request" });
  }
});

/**
 * GET /api/auth/verify-reset-token/:token
 * Public — the front-end calls this when the reset page loads to check
 * whether the token is still valid before showing the form.
 */
router.get("/verify-reset-token/:token", async (req, res) => {
  try {
    const doc = await PasswordResetToken.verifyToken(req.params.token);

    if (!doc) {
      return res
        .status(400)
        .json({ valid: false, error: "Invalid or expired reset link" });
    }

    res.json({ valid: true });
  } catch (err) {
    console.error("Verify reset token error:", err);
    res.status(500).json({ error: "Server error while verifying token" });
  }
});

/**
 * POST /api/auth/reset-password
 * Public — user submits the new password along with their reset token.
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Reset token is required" });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.message });
    }

    const doc = await PasswordResetToken.verifyToken(token);
    if (!doc) {
      return res
        .status(400)
        .json({ error: "Invalid or expired reset link. Please request a new one." });
    }

    const user = await User.findById(doc.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update password (the pre-save hook in User model will hash it)
    user.password = password;
    await user.save();

    // Clean up the used token
    await PasswordResetToken.deleteMany({ userId: user._id });

    res.json({ message: "Your password has been reset successfully." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error while resetting password" });
  }
});

export default router;
