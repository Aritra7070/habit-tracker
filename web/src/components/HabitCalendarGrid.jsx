import { buildCalendarMonth } from "../utils/buildCalendarMonth";
import MonthNav from "./MonthNav";

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getCellStyle(cell) {
  if (!cell || !cell.isCurrentMonth) {
    return "invisible";
  }

  if (cell.isCompleted) {
    return "border-accent-500 bg-accent-500 text-white shadow-sm shadow-accent-200";
  }

  if (cell.isFuture && cell.isScheduled) {
    return "border-dashed border-surface-200 bg-surface-50 text-surface-300";
  }

  if (cell.isToday) {
    return "border-accent-300 bg-white font-semibold text-accent-700 ring-2 ring-accent-300";
  }

  if (cell.isScheduled) {
    return "border-danger-400/30 bg-danger-400/10 text-danger-500";
  }

  return "border-transparent text-surface-300";
}

export default function HabitCalendarGrid({ habit, year, month, onMonthChange }) {
  const cells = buildCalendarMonth(year, month, habit);

  return (
    <div>
      <MonthNav year={year} month={month} onChange={onMonthChange} />

      <div className="mb-1 grid grid-cols-7">
        {DAY_HEADERS.map((day) => (
          <div key={day} className="py-1 text-center text-[11px] font-semibold text-surface-400">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell, index) => (
          <div
            key={`${cell?.dateStr ?? "empty"}-${index}`}
            className={`flex aspect-square min-h-9 items-center justify-center rounded-xl border text-[12px] transition-all ${getCellStyle(cell)}`}
          >
            {cell?.day}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-[12px] text-surface-500">
        <LegendItem label="Completed" className="border-accent-500 bg-accent-500" />
        <LegendItem label="Missed" className="border-danger-400/30 bg-danger-400/10" />
        <LegendItem label="Upcoming" className="border-dashed border-surface-200 bg-surface-50" />
      </div>
    </div>
  );
}

function LegendItem({ label, className }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-surface-50 px-2.5 py-1">
      <span className={`h-2.5 w-2.5 rounded-sm border ${className}`} />
      {label}
    </span>
  );
}
