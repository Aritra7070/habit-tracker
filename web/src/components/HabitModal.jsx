import { useState, useEffect } from "react";
import InlineError from "./InlineError";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../utils/api";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function HabitModal({ habit, onSave, onClose }) {
  const { token } = useAuth();
  const { subscribeDevice } = usePushNotifications();
  const [name, setName] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [goal, setGoal] = useState("");
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderTimes, setReminderTimes] = useState([""]);
  const [notificationType, setNotificationType] = useState("push");
  const [notificationStatus, setNotificationStatus] = useState(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(habit);

  useEffect(() => {
    let isMounted = true;

    async function loadReminderDefaults() {
      try {
        const data = await apiRequest("/api/settings", { token });
        const defaults = data.settings?.reminderDefaults;

        if (!isMounted || habit) return;

        if (defaults?.times?.length) {
          setReminderTimes(defaults.times);
          setHasReminder(true);
        }

        if (defaults?.notificationType) {
          setNotificationType(defaults.notificationType);
        }
      } catch {
        // New habits still work without account defaults.
      }
    }

    if (habit) {
      setName(habit.name);
      setSchedule(habit.schedule || []);
      setGoal(habit.goal || "");
      setHasReminder(habit.hasReminder || false);
      setReminderTimes(
        habit.reminderTimes?.length
          ? habit.reminderTimes
          : habit.reminderTime
            ? [habit.reminderTime]
            : [""]
      );
      setNotificationType(habit.notificationType || "push");
    } else {
      loadReminderDefaults();
    }

    return () => {
      isMounted = false;
    };
  }, [habit, token]);

  function toggleDay(day) {
    setSchedule((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleReminderToggle() {
    const nextValue = !hasReminder;
    setHasReminder(nextValue);

    if (nextValue) {
      try {
        const result = await subscribeDevice();
        setNotificationStatus(result.ok ? "granted" : result.reason);
      } catch {
        setNotificationStatus("unavailable");
      }
    }
  }

  function addReminderTime() {
    setReminderTimes((prev) => [...prev, ""]);
  }

  function updateReminderTime(index, value) {
    setReminderTimes((prev) =>
      prev.map((time, timeIndex) => (timeIndex === index ? value : time))
    );
  }

  function removeReminderTime(index) {
    setReminderTimes((prev) =>
      prev.length === 1 ? [""] : prev.filter((_, timeIndex) => timeIndex !== index)
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Name is required"); return; }
    const normalizedReminderTimes = [...new Set(reminderTimes.filter(Boolean))].sort();
    if (hasReminder && normalizedReminderTimes.length === 0) {
      setError("At least one reminder time is required");
      return;
    }
    setIsSaving(true);
    try {
      if (hasReminder && ["push", "both"].includes(notificationType)) {
        const result = await subscribeDevice();
        setNotificationStatus(result.ok ? "granted" : result.reason);
      }

      await onSave({
        name: name.trim(),
        schedule,
        goal: goal.trim(),
        hasReminder,
        reminderTime: hasReminder ? normalizedReminderTimes[0] : "",
        reminderTimes: hasReminder ? normalizedReminderTimes : [],
        notificationType,
        reminderTimezone:
          Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
      <div className="w-full max-w-md mx-4 bg-white rounded-2xl border border-surface-200 shadow-xl">
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-surface-800">
            {isEditing ? "Edit Habit" : "New Habit"}
          </h2>
          <button onClick={onClose} className="cursor-pointer p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors" aria-label="Close">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <InlineError message={error} />

          <div>
            <label htmlFor="habit-name" className="block text-[13px] font-medium text-surface-600 mb-1.5">Habit name</label>
            <input id="habit-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Morning run"
              className="w-full text-[13px] border border-surface-200 rounded-xl px-3.5 py-2.5 text-surface-800 placeholder-surface-400 outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100 transition-all" autoFocus />
          </div>

          <div>
            <span className="block text-[13px] font-medium text-surface-600 mb-2">Schedule</span>
            <div className="flex gap-1.5">
              {WEEKDAYS.map((day) => (
                <button key={day} type="button" onClick={() => toggleDay(day)}
                  className={`cursor-pointer flex-1 text-[12px] py-1.5 rounded-lg transition-all ${
                    schedule.includes(day)
                      ? "bg-accent-500 text-white shadow-sm shadow-accent-200"
                      : "border border-surface-200 text-surface-500 hover:border-surface-300 hover:bg-surface-50"
                  }`}>
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="habit-goal" className="block text-[13px] font-medium text-surface-600 mb-1.5">
              Goal <span className="text-surface-400 font-normal">(optional)</span>
            </label>
            <textarea id="habit-goal" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Run 5km every session" rows={2}
              className="w-full text-[13px] border border-surface-200 rounded-xl px-3.5 py-2.5 text-surface-800 placeholder-surface-400 outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100 transition-all resize-none" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-medium text-surface-600">Enable reminder</span>
              <button 
                type="button"
                onClick={handleReminderToggle}
                className={`cursor-pointer relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 ${hasReminder ? 'bg-accent-500' : 'bg-surface-300'}`}
                aria-pressed={hasReminder}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${hasReminder ? 'translate-x-[18px]' : 'translate-x-1'}`} />
              </button>
            </div>
            
            {hasReminder && (
              <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="mb-3">
                  <span className="block text-[13px] font-medium text-surface-600 mb-2">Notification type</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["email", "push", "both"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNotificationType(type)}
                        className={`cursor-pointer rounded-lg px-3 py-1.5 text-[12px] capitalize transition-all ${
                          notificationType === type
                            ? "bg-accent-500 text-white shadow-sm shadow-accent-200"
                            : "border border-surface-200 text-surface-500 hover:bg-surface-50"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[13px] font-medium text-surface-600">Reminder times</label>
                  <button
                    type="button"
                    onClick={addReminderTime}
                    className="cursor-pointer text-[12px] font-medium text-accent-600 hover:text-accent-700"
                  >
                    Add time
                  </button>
                </div>
                <div className="space-y-2">
                  {reminderTimes.map((time, index) => (
                    <div key={`reminder-time-${index}`} className="flex gap-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => updateReminderTime(index, e.target.value)}
                        className="w-full text-[14px] border border-surface-200 rounded-xl px-3.5 py-2.5 text-surface-800 placeholder-surface-400 outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-100 transition-all [&::-webkit-datetime-edit]:outline-none [&::-webkit-datetime-edit-fields-wrapper]:outline-none [&::-webkit-datetime-edit-hour-field]:focus:bg-accent-100 [&::-webkit-datetime-edit-minute-field]:focus:bg-accent-100 [&::-webkit-datetime-edit-hour-field]:focus:text-accent-700 [&::-webkit-datetime-edit-minute-field]:focus:text-accent-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeReminderTime(index)}
                        className="cursor-pointer rounded-xl border border-surface-200 px-3 text-surface-400 transition-colors hover:bg-danger-400/10 hover:text-danger-500"
                        aria-label="Remove reminder time"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                {notificationStatus === "denied" && (
                  <p className="mt-2 text-[12px] text-amber-600">
                    Browser notifications are blocked. In-app reminders will still appear while the app is open.
                  </p>
                )}
                {notificationStatus === "unsupported" && (
                  <p className="mt-2 text-[12px] text-surface-400">
                    This browser does not support system notifications. In-app reminders will still appear.
                  </p>
                )}
                {notificationStatus === "unavailable" && (
                  <p className="mt-2 text-[12px] text-amber-600">
                    Push notifications are not available yet. In-app reminders will still appear while the app is open.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button type="button" onClick={onClose} className="cursor-pointer text-[13px] px-4 py-2 rounded-xl border border-surface-200 text-surface-600 hover:bg-surface-50 transition-all">Cancel</button>
            <button type="submit" disabled={isSaving}
              className="cursor-pointer text-[13px] font-medium px-5 py-2 rounded-xl bg-accent-500 text-white shadow-sm shadow-accent-200 hover:bg-accent-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Create Habit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
