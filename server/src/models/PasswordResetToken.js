import mongoose from "mongoose";
import crypto from "crypto";

const passwordResetTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
    },
  },
  { timestamps: true }
);

// Auto-delete expired tokens via MongoDB TTL index
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Generate a secure random token and create a reset-token document.
 * Any existing tokens for the same user are removed first.
 */
passwordResetTokenSchema.statics.createToken = async function (userId) {
  // Remove any previously issued tokens for this user
  await this.deleteMany({ userId });

  const token = crypto.randomBytes(32).toString("hex");

  const resetToken = await this.create({ userId, token });
  return resetToken.token;
};

/**
 * Verify a token string: returns the document if valid, null if expired / missing.
 */
passwordResetTokenSchema.statics.verifyToken = async function (token) {
  const doc = await this.findOne({ token });

  if (!doc) return null;

  // Double-check expiry (TTL cleanup is eventual, not instant)
  if (doc.expiresAt < new Date()) {
    await doc.deleteOne();
    return null;
  }

  return doc;
};

const PasswordResetToken = mongoose.model(
  "PasswordResetToken",
  passwordResetTokenSchema
);

export default PasswordResetToken;
