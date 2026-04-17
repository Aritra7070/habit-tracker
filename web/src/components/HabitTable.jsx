import { isCompletedToday, getTodayHabits } from "../utils/getTodayHabits";
import CategoryBadge from "./CategoryBadge";

const FILTERS = ["Today", "Missed", "All Completed", "All"];

function getCategory(habit) {
  const g = (habit.goal || "").toLowerCase();
  if (g.includes("fitness")) return "Fitness";
  if (g.includes("personal")) return "Personal Growth";
  return "Health";
}

function applyFilter(habits, filter) {
  const todayHabits = getTodayHabits(habits);
  switch (filter) {
    case "Today": return todayHabits;
    case "Missed": return todayHabits.filter((h) => !isCompletedToday(h));
    case "All Completed": return habits.filter((h) => isCompletedToday(h));
    default: return habits;
  }
}

export default function HabitTable({ habits, filter, onFilterChange, onToggle }) {
  const filtered = applyFilter(habits, filter);

  return (
    <div className="bg-white border border-gray-100 rounded-xl">
      <div className="px-5 pt-5 pb-3">
        <h2 className="text-[18px] font-bold text-gray-800 mb-3">My Habit Tracker</h2>
        <FilterBar active={filter} onChange={onFilterChange} />
      </div>
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-y border-gray-100 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
            <th className="py-2 px-5 w-8" />
            <th className="py-2 px-2">Habit</th>
            <th className="py-2 px-2">Description</th>
            <th className="py-2 px-2">Category</th>
            <th className="py-2 px-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((h) => (
            <HabitRow key={h._id} habit={h} onToggle={onToggle} />
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && (
        <p className="text-center text-[13px] text-gray-400 py-8">No habits match this filter.</p>
      )}
    </div>
  );
}

function HabitRow({ habit, onToggle }) {
  const done = isCompletedToday(habit);
  const date = habit.createdAt ? new Date(habit.createdAt).toLocaleDateString() : "—";
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <td className="py-2.5 px-5">
        <input type="checkbox" checked={done} onChange={() => onToggle(habit._id)}
          className="w-4 h-4 rounded border-gray-300 text-teal-500 cursor-pointer accent-teal-500" />
      </td>
      <td className={`py-2.5 px-2 font-medium ${done ? "line-through text-gray-400" : "text-gray-700"}`}>{habit.name}</td>
      <td className="py-2.5 px-2 text-gray-400 truncate max-w-[180px]">{habit.goal || "—"}</td>
      <td className="py-2.5 px-2"><CategoryBadge category={getCategory(habit)} /></td>
      <td className="py-2.5 px-2 text-gray-400">{date}</td>
    </tr>
  );
}

function FilterBar({ active, onChange }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {FILTERS.map((f) => (
        <button key={f} onClick={() => onChange(f)}
          className={`cursor-pointer text-[12px] px-3 py-1.5 rounded-full transition-all ${
            active === f ? "bg-white shadow-sm text-gray-800 font-medium" : "text-gray-500 hover:text-gray-700"
          }`}>
          {active === f && <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-500 mr-1.5 align-middle" />}
          {f}
        </button>
      ))}
    </div>
  );
}
