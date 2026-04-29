import { Router } from "express";
import User from "../models/User.js";
import { validateEmail, validateName } from "../utils/validate.js";

const router = Router();
const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const VALID_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const VALID_TIME_FORMATS = ["12h", "24h"];

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  reminderDefaults: {
    times: [],
    notificationType: "push",
  },
  offMode: {
    start: "",
    end: "",
    vacationMode: false,
    autoPauseStreaks: true,
    offDays: [],
  },
  locale: {
    timeZone: "UTC",
    timeFormat: "12h",
    language: "en",
  },
};

function uniqueTimes(times = []) {
  return [...new Set(times.filter(Boolean))].sort();
}

function uniqueDays(days = []) {
  return VALID_DAYS.filter((day) => days.includes(day));
}

function formatSettings(user) {
  const settings = user.settings || {};

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    settings: {
      emailNotifications:
        settings.emailNotifications ?? DEFAULT_SETTINGS.emailNotifications,
      reminderDefaults: {
        times: settings.reminderDefaults?.times || DEFAULT_SETTINGS.reminderDefaults.times,
        notificationType:
          settings.reminderDefaults?.notificationType ||
          DEFAULT_SETTINGS.reminderDefaults.notificationType,
      },
      offMode: {
        start: settings.offMode?.start || DEFAULT_SETTINGS.offMode.start,
        end: settings.offMode?.end || DEFAULT_SETTINGS.offMode.end,
        vacationMode:
          settings.offMode?.vacationMode ?? DEFAULT_SETTINGS.offMode.vacationMode,
        autoPauseStreaks:
          settings.offMode?.autoPauseStreaks ??
          DEFAULT_SETTINGS.offMode.autoPauseStreaks,
        offDays: settings.offMode?.offDays || DEFAULT_SETTINGS.offMode.offDays,
      },
      locale: {
        timeZone: settings.locale?.timeZone || DEFAULT_SETTINGS.locale.timeZone,
        timeFormat:
          settings.locale?.timeFormat || DEFAULT_SETTINGS.locale.timeFormat,
        language: settings.locale?.language || DEFAULT_SETTINGS.locale.language,
      },
    },
  };
}

function validateOffMode(offMode) {
  const value = {
    start: offMode?.start || "",
    end: offMode?.end || "",
    vacationMode: Boolean(offMode?.vacationMode),
    autoPauseStreaks: offMode?.autoPauseStreaks !== false,
    offDays: uniqueDays(offMode?.offDays || []),
  };

  if (!value.start && !value.end) {
    return { valid: true, value: { ...value, start: "", end: "" } };
  }

  if (!DATE_KEY_REGEX.test(value.start) || !DATE_KEY_REGEX.test(value.end)) {
    return { valid: false, message: "Off mode requires valid start and end dates" };
  }

  if (value.end < value.start) {
    return { valid: false, message: "Off mode end date must be after start date" };
  }

  return { valid: true, value };
}

function validateReminderDefaults(reminderDefaults = {}) {
  const times = uniqueTimes(reminderDefaults.times || []);
  const invalidTime = times.find((time) => !TIME_REGEX.test(time));

  if (invalidTime) {
    return { valid: false, message: "Reminder time must use HH:MM format" };
  }

  const notificationType = reminderDefaults.notificationType || "push";
  if (!VALID_NOTIFICATION_TYPES.includes(notificationType)) {
    return { valid: false, message: "Invalid notification type" };
  }

  return { valid: true, value: { times, notificationType } };
}

function validateLocale(locale = {}) {
  const timeFormat = locale.timeFormat || DEFAULT_SETTINGS.locale.timeFormat;

  if (!VALID_TIME_FORMATS.includes(timeFormat)) {
    return { valid: false, message: "Invalid time format" };
  }

  return {
    valid: true,
    value: {
      timeZone: (locale.timeZone || DEFAULT_SETTINGS.locale.timeZone).trim(),
      timeFormat,
      language: (locale.language || DEFAULT_SETTINGS.locale.language).trim(),
    },
  };
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

    if (!user.settings.reminderDefaults) {
      user.settings.reminderDefaults = {};
    }

    if (!user.settings.locale) {
      user.settings.locale = {};
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

    if (settings.reminderDefaults !== undefined) {
      const reminderCheck = validateReminderDefaults(settings.reminderDefaults);
      if (!reminderCheck.valid) {
        return res.status(400).json({ error: reminderCheck.message });
      }

      user.settings.reminderDefaults = reminderCheck.value;
    }

    if (settings.locale !== undefined) {
      const localeCheck = validateLocale(settings.locale);
      if (!localeCheck.valid) {
        return res.status(400).json({ error: localeCheck.message });
      }

      user.settings.locale = localeCheck.value;
    }

    await user.save();
    res.json(formatSettings(user));
  } catch (err) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;
