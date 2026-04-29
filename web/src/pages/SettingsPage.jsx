import { useEffect, useState } from "react";
import InlineError from "../components/InlineError";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../utils/api";

const EMPTY_OFF_MODE = { start: "", end: "" };

function getInitials(name) {
  return name
    ? name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";
}

export default function SettingsPage() {
  const { token, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    offMode: EMPTY_OFF_MODE,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempOffMode, setTempOffMode] = useState(EMPTY_OFF_MODE);

  useEffect(() => {
    let isMounted = true;

    async function fetchSettings() {
      setIsLoading(true);
      setError("");

      try {
        const data = await apiRequest("/api/settings", { token });

        if (!isMounted) return;

        setProfile({
          name: data.user.name || "",
          email: data.user.email || "",
        });
        setSettings({
          emailNotifications: data.settings.emailNotifications,
          offMode: data.settings.offMode || EMPTY_OFF_MODE,
        });
        updateUser(data.user);
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, [token, updateUser]);

  async function saveSettings(nextProfile, nextSettings, savingSetter) {
    savingSetter(true);
    setError("");
    setSuccessMessage("");

    try {
      const data = await apiRequest("/api/settings", {
        method: "PUT",
        token,
        body: JSON.stringify({
          name: nextProfile.name,
          email: nextProfile.email,
          settings: nextSettings,
        }),
      });

      setProfile({
        name: data.user.name || "",
        email: data.user.email || "",
      });
      setSettings({
        emailNotifications: data.settings.emailNotifications,
        offMode: data.settings.offMode || EMPTY_OFF_MODE,
      });
      updateUser(data.user);
      setSuccessMessage("Settings saved.");
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      savingSetter(false);
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    await saveSettings(profile, settings, setIsSavingProfile).catch(() => {});
  }

  async function handleEmailNotificationsChange(event) {
    const nextSettings = {
      ...settings,
      emailNotifications: event.target.checked,
    };

    setSettings(nextSettings);
    await saveSettings(profile, nextSettings, setIsSavingPreferences).catch(() => {
      setSettings(settings);
    });
  }

  function openOffModeModal() {
    setTempOffMode(settings.offMode?.start ? settings.offMode : EMPTY_OFF_MODE);
    setIsModalOpen(true);
  }

  async function handleSaveOffMode() {
    if (!tempOffMode.start || !tempOffMode.end) {
      setError("Please select both off mode dates.");
      return;
    }

    const nextSettings = { ...settings, offMode: tempOffMode };
    await saveSettings(profile, nextSettings, setIsSavingPreferences)
      .then(() => setIsModalOpen(false))
      .catch(() => {});
  }

  async function handleClearOffMode() {
    const nextSettings = { ...settings, offMode: EMPTY_OFF_MODE };
    await saveSettings(profile, nextSettings, setIsSavingPreferences)
      .then(() => setIsModalOpen(false))
      .catch(() => {});
  }

  const hasOffMode = Boolean(settings.offMode?.start && settings.offMode?.end);

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[820px] space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Settings</h1>
        <p className="mt-1 text-sm text-surface-500">
          Keep your profile and habit preferences in sync.
        </p>
      </div>

      <InlineError message={error} />
      {successMessage && (
        <div className="rounded-xl border border-success-400/20 bg-success-400/10 px-3 py-2.5 text-[13px] text-success-600">
          {successMessage}
        </div>
      )}

      <form
        onSubmit={handleProfileSubmit}
        className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-surface-800">User Profile</h2>
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-100 text-xl font-bold text-accent-600">
            {getInitials(profile.name)}
          </div>
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-surface-400">
                Name
              </span>
              <input
                value={profile.name}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, name: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-800 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-surface-400">
                Email
              </span>
              <input
                type="email"
                value={profile.email}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, email: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-800 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
                required
              />
            </label>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={isSavingProfile}
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingProfile ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>

      <section className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-surface-800">App Preferences</h2>
        <div className="mt-4 divide-y divide-surface-100">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-surface-800">Dark Mode</p>
              <p className="text-sm text-surface-400">Coming soon</p>
            </div>
            <span className="text-sm text-surface-400">Unavailable</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-surface-800">Email Notifications</p>
              <p className="text-sm text-surface-400">Save reminder email preference.</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={handleEmailNotificationsChange}
                disabled={isSavingPreferences}
                className="peer sr-only"
              />
              <span className="h-6 w-11 rounded-full bg-surface-200 transition peer-checked:bg-accent-500 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent-100" />
              <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-surface-800">Mood & Focus</h2>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-surface-900">Off Mode</p>
            {hasOffMode ? (
              <p className="mt-1 text-sm font-medium text-accent-600">
                Active: {settings.offMode.start} to {settings.offMode.end}
              </p>
            ) : (
              <p className="mt-1 text-sm text-surface-500">
                Pause streaks and hide habits while you rest.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={openOffModeModal}
            className="rounded-lg border border-surface-200 bg-surface-50 px-4 py-2 text-sm font-semibold text-surface-700 transition hover:bg-surface-100"
          >
            {hasOffMode ? "Edit Days" : "Set Off Days"}
          </button>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/70 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-surface-900">
                Set Off Mode Timeline
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md px-2 py-1 text-xl leading-none text-surface-400 hover:bg-surface-100 hover:text-surface-700"
                aria-label="Close off mode dialog"
              >
                x
              </button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-surface-400">
                  Start Date
                </span>
                <input
                  type="date"
                  value={tempOffMode.start}
                  onChange={(event) =>
                    setTempOffMode((current) => ({
                      ...current,
                      start: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-surface-400">
                  End Date
                </span>
                <input
                  type="date"
                  value={tempOffMode.end}
                  min={tempOffMode.start}
                  onChange={(event) =>
                    setTempOffMode((current) => ({
                      ...current,
                      end: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
                />
              </label>
            </div>
            <div className="mt-7 flex flex-wrap justify-end gap-3">
              {hasOffMode && (
                <button
                  type="button"
                  onClick={handleClearOffMode}
                  disabled={isSavingPreferences}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-danger-500 hover:bg-danger-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-semibold text-surface-600 hover:bg-surface-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveOffMode}
                disabled={isSavingPreferences}
                className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingPreferences ? "Saving..." : "Save Timeline"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
