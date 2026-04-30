import cron from "node-cron";
import webpush from "web-push";
import Habit from "../models/Habit.js";
import PushSubscription from "../models/PushSubscription.js";
import User from "../models/User.js";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getTodayCompletionKey() {
  return new Date().toISOString().split("T")[0];
}

function getTodayDateKey() {
  return new Date().toISOString().split("T")[0];
}

function isOffModeActive(settings, dayName) {
  const offMode = settings?.offMode;

  if (!offMode) {
    return false;
  }

  const today = getTodayDateKey();
  const inTimeline = offMode.start && offMode.end && today >= offMode.start && today <= offMode.end;

  return Boolean(
    offMode.vacationMode ||
      inTimeline ||
      offMode.offDays?.includes(dayName)
  );
}

function getReminderWindow(timeZone = "UTC") {
  let formatter;

  try {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
  } catch {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
  }

  const parts = formatter.formatToParts(new Date());
  const getPart = (type) => parts.find((part) => part.type === type)?.value;

  return {
    dayName: getPart("weekday") || DAY_NAMES[new Date().getUTCDay()],
    time: `${getPart("hour")}:${getPart("minute")}`,
  };
}

function configureWebPush() {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn("Push notifications are disabled: VAPID env vars are missing");
    return false;
  }

  webpush.setVapidDetails(
    VAPID_SUBJECT || "http://localhost:3000",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );

  return true;
}

async function removeExpiredSubscription(subscriptionId) {
  await PushSubscription.deleteOne({ _id: subscriptionId });
}

async function sendReminder(subscription, habit) {
  const payload = JSON.stringify({
    title: "Time for your habit!",
    body: habit.name,
    url: "/habits",
    habitId: habit._id,
  });

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      payload
    );
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      await removeExpiredSubscription(subscription._id);
      return;
    }

    console.error("Failed to send reminder push:", err.message);
  }
}

async function sendDueReminders() {
  const habits = await Habit.find({
    hasReminder: true,
  }).select(
    "_id userId name reminderTime reminderTimes reminderTimezone notificationType schedule completions"
  );

  if (habits.length === 0) {
    return;
  }

  const todayCompletionKey = getTodayCompletionKey();
  const dueHabits = habits.filter((habit) => {
    const { dayName, time } = getReminderWindow(habit.reminderTimezone);
    const completedToday = habit.completions.includes(todayCompletionKey);

    return (
      !completedToday &&
      (habit.reminderTimes?.length
        ? habit.reminderTimes
        : habit.reminderTime
          ? [habit.reminderTime]
          : []
      ).includes(time) &&
      ["push", "both"].includes(habit.notificationType || "push") &&
      habit.schedule.includes(dayName)
    );
  });

  for (const habit of dueHabits) {
    const { dayName } = getReminderWindow(habit.reminderTimezone);
    const user = await User.findById(habit.userId).select("settings");

    if (isOffModeActive(user?.settings, dayName)) {
      continue;
    }

    const subscriptions = await PushSubscription.find({ userId: habit.userId });

    await Promise.all(
      subscriptions.map((subscription) => sendReminder(subscription, habit))
    );
  }
}

export function startReminderScheduler() {
  if (!configureWebPush()) {
    return;
  }
  cron.schedule("* * * * *", () => {
    sendDueReminders().catch((err) => {
      console.error("Reminder scheduler failed:", err.message);
    });
  });
}
