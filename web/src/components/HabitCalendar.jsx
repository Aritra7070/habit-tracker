import { useState } from "react";

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getAllCompletionDates(habits) {
  const map = {};
  habits.forEach((h) => {
    (h.completions || []).forEach((d) => {
      if (!map[d]) map[d] = [];
      map[d].push(h);
    });
  });
  return map;
}

function getMonthDays(year, month) {
  const first = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const startPad = first.getDay();
  return { lastDay, startPad };
}

export default function HabitCalendar({ habits }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const { lastDay, startPad } = getMonthDays(year, month);
  const completionMap = getAllCompletionDates(habits);
  const todayStr = now.toISOString().split("T")[0];
  const monthLabel = new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" });

  function prev() { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); }
  function next() { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); }
  function goToday() { setYear(now.getFullYear()); setMonth(now.getMonth()); }

  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= lastDay; d++) cells.push(d);

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <CalendarHeader label={monthLabel} onPrev={prev} onNext={next} onToday={goToday} />
      <div className="grid grid-cols-7 text-center text-[11px] font-medium text-gray-400 mb-2">
        {DAY_HEADERS.map((d) => <div key={d} className="py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 text-center text-[13px]">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;
          const dots = completionMap[dateStr] || [];
          return (
            <div key={i} className="py-1.5">
              <div className={`mx-auto w-8 h-8 flex flex-col items-center justify-center rounded-full ${isToday ? "bg-teal-500 text-white font-semibold" : "text-gray-700"}`}>
                <span className="leading-none">{day}</span>
              </div>
              <div className="flex justify-center gap-0.5 mt-0.5 h-2">
                {dots.slice(0, 3).map((_, j) => (
                  <span key={j} className="block w-1 h-1 rounded-full bg-teal-400" />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarHeader({ label, onPrev, onNext, onToday }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
        <span className="text-[15px] font-semibold text-gray-800">Habit Calendar</span>
      </div>
      <div className="flex items-center gap-1.5">
        <NavBtn onClick={onPrev}>&larr;</NavBtn>
        <span className="text-[13px] text-gray-600 min-w-[130px] text-center">{label}</span>
        <NavBtn onClick={onNext}>&rarr;</NavBtn>
        <button onClick={onToday} className="cursor-pointer ml-2 text-[11px] text-teal-600 hover:text-teal-700 px-2 py-1 rounded hover:bg-teal-50 transition-colors">Today</button>
      </div>
    </div>
  );
}

function NavBtn({ onClick, children }) {
  return (
    <button onClick={onClick} className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-[14px]">
      {children}
    </button>
  );
}
