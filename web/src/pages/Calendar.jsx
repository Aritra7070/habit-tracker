import { useState } from "react";
import { Link } from "react-router-dom";
import HabitCalendarGrid from "../components/HabitCalendarGrid";
import { useHabits } from "../hooks/useHabits";

function formatSchedule(schedule = []) {
  return schedule.length ? schedule.join(" | ") : "No schedule";
}

export default function Calendar() {
  const { habits, isLoading, error } = useHabits();
  const now = new Date();
  const [selectedId, setSelectedId] = useState(null);
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth());
  const selectedHabit = habits.find((habit) => habit._id === selectedId) ?? habits[0] ?? null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-accent-200 border-t-accent-500" />
      </div>
    );
  }

  if (habits.length === 0 && !error) return <EmptyState />;

  return (
    <div className="mx-auto max-w-[820px] space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-surface-400">Completion history</p>
        <h1 className="mt-1 text-[24px] font-bold text-surface-900">Habit Calendar</h1>
        <p className="mt-1 text-[13px] text-surface-500">View completed, missed, and upcoming scheduled days for each habit.</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-danger-500/20 bg-danger-500/10 px-4 py-3 text-[13px] text-danger-600">{error}</div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {habits.map((habit) => (
          <button
            key={habit._id}
            type="button"
            onClick={() => setSelectedId(habit._id)}
            className={`cursor-pointer rounded-xl px-3 py-2 text-[13px] font-medium transition-colors ${selectedHabit?._id === habit._id ? "bg-accent-500 text-white shadow-sm shadow-accent-200" : "bg-white text-surface-600 hover:bg-surface-100"}`}
          >
            {habit.name}
          </button>
        ))}
      </div>

      {selectedHabit ? (
        <section className="rounded-[24px] bg-white p-6 shadow-[0_14px_32px_rgba(42,42,61,0.08)]">
          <div className="mb-5 border-b border-surface-100 pb-5">
            <h2 className="truncate text-[18px] font-semibold text-surface-900">{selectedHabit.name}</h2>
            <p className="mt-1 text-[12px] text-surface-500">{formatSchedule(selectedHabit.schedule)} | {selectedHabit.completions?.length ?? 0} total completions</p>
          </div>
          <HabitCalendarGrid habit={selectedHabit} year={year} month={month} onMonthChange={(nextYear, nextMonth) => {
            setYear(nextYear);
            setMonth(nextMonth);
          }} />
        </section>
      ) : null}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-xl rounded-[24px] bg-white px-6 py-16 text-center shadow-[0_14px_32px_rgba(42,42,61,0.08)]">
      <h1 className="text-[20px] font-semibold text-surface-800">No habits yet</h1>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-surface-500">Create a habit first, then its completion calendar will appear here.</p>
      <Link to="/habits" className="mt-5 inline-flex rounded-xl bg-accent-500 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-accent-600">
        Add a habit
      </Link>
    </div>
  );
}
