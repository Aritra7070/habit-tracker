import ProgressBar from "./ProgressBar";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const JS_DAYS = [1, 2, 3, 4, 5, 6, 0];

function getMonday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

function getWeekCompletions(habit) {
  const monday = getMonday();
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return (habit.completions || []).filter((s) => {
    const d = new Date(s);
    return d >= monday && d <= today;
  });
}

function getDayState(i, schedule, weekCompletions) {
  if (weekCompletions.some((s) => new Date(s).getDay() === JS_DAYS[i])) return "completed";
  if (schedule.includes(DAY_NAMES[i])) return "scheduled";
  return "off";
}

const CIRCLE = {
  completed: "bg-green-500 border-green-500 text-white",
  scheduled: "border-purple-300 text-purple-400",
  off: "border-gray-200 text-gray-300",
};

export default function HabitCard({ habit, onToggleComplete, onEdit, onDelete }) {
  const weekCompletions = getWeekCompletions(habit);
  const todayName = DAY_NAMES[(new Date().getDay() + 6) % 7];
  const todayScheduled = habit.schedule.includes(todayName);
  const todayStr = new Date().toISOString().split("T")[0];
  const doneToday = (habit.completions || []).includes(todayStr);
  const pct = habit.schedule.length
    ? Math.min(100, Math.round((weekCompletions.length / habit.schedule.length) * 100))
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-5 transition-shadow duration-200 hover:shadow-md hover:shadow-surface-200/60 group">
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <h3 className={`text-[14px] font-semibold truncate ${doneToday ? "line-through text-surface-400" : "text-surface-800"}`}>
            {habit.name}
          </h3>
          {habit.goal && <p className="text-[12px] text-surface-400 truncate mt-0.5">{habit.goal}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {todayScheduled && (
            <button
              onClick={() => !doneToday && onToggleComplete(habit._id)}
              disabled={doneToday}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                doneToday
                  ? "bg-green-500 text-white cursor-default"
                  : "cursor-pointer border border-gray-300 text-gray-400 hover:border-green-500 hover:text-green-500"
              }`}
              title={doneToday ? "Completed today ✓" : "Mark today as done"}
              aria-label={doneToday ? "Completed today" : "Mark today as done"}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </button>
          )}
          <button onClick={() => onEdit(habit)} className="cursor-pointer p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors" aria-label="Edit">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
            </svg>
          </button>
          <button onClick={() => onDelete(habit)} className="cursor-pointer p-1.5 rounded-lg hover:bg-danger-400/10 text-surface-400 hover:text-danger-500 transition-colors" aria-label="Delete">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-3">
        {DAY_LABELS.map((label, i) => {
          const state = getDayState(i, habit.schedule, weekCompletions);
          return (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] font-medium text-surface-400">{label}</span>
              <span className={`flex items-center justify-center w-6 h-6 rounded-full border-[1.5px] ${CIRCLE[state]}`}>
                {state === "completed" && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <ProgressBar value={pct / 100} />
    </div>
  );
}
