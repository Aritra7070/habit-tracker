import { Router } from "express";
import User from "../models/User.js";
import { validateEmail, validateName } from "../utils/validate.js";

const router = Router();
const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function formatSettings(user) {
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    settings: {
      emailNotifications: user.settings?.emailNotifications ?? true,
      offMode: {
        start: user.settings?.offMode?.start || "",
        end: user.settings?.offMode?.end || "",
      },
    },
  };
}

function validateOffMode(offMode) {
  if (!offMode || (!offMode.start && !offMode.end)) {
    return { valid: true, value: { start: "", end: "" } };
  }

  const start = offMode.start || "";
  const end = offMode.end || "";

  if (!DATE_KEY_REGEX.test(start) || !DATE_KEY_REGEX.test(end)) {
    return { valid: false, message: "Off mode requires valid start and end dates" };
  }

  if (end < start) {
    return { valid: false, message: "Off mode end date must be after start date" };
  }

  return { valid: true, value: { start, end } };
}

router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(formatSettings(user));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.put("/", async (req, res) => {
  try {
    const { name, email, settings = {} } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.settings) {
      user.settings = {};
    }

    if (!user.settings.offMode) {
      user.settings.offMode = {};
    }

    if (name !== undefined) {
      const nameCheck = validateName(name);
      if (!nameCheck.valid) {
        return res.status(400).json({ error: nameCheck.message });
      }
      user.name = name.trim();
    }

    if (email !== undefined) {
      const emailCheck = validateEmail(email);
      if (!emailCheck.valid) {
        return res.status(400).json({ error: emailCheck.message });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(409).json({ error: "Email is already registered" });
      }

      user.email = normalizedEmail;
    }

    if (settings.emailNotifications !== undefined) {
      user.settings.emailNotifications = Boolean(settings.emailNotifications);
    }

    if (settings.offMode !== undefined) {
      const offModeCheck = validateOffMode(settings.offMode);
      if (!offModeCheck.valid) {
        return res.status(400).json({ error: offModeCheck.message });
      }

      user.settings.offMode = offModeCheck.value;
    }

    await user.save();
    res.json(formatSettings(user));
  } catch (err) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;
