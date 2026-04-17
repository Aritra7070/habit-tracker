import { useState } from "react";
import { useHabits } from "../hooks/useHabits";
import { useAuth } from "../context/AuthContext";
import HabitTable from "../components/HabitTable";
import DonutChart from "../components/DonutChart";
import HabitCalendar from "../components/HabitCalendar";

export default function Habits() {
  const { habits, isLoading, error, toggleCompletion } = useHabits();
  const { signout } = useAuth();
  const [filter, setFilter] = useState("All");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-teal-200 border-t-teal-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar onSignout={signout} />
      <HeroBanner />

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {error && (
          <div className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">{error}</div>
        )}

        <div className="flex gap-6">
          <div className="flex-[6] min-w-0">
            <HabitTable habits={habits} filter={filter} onFilterChange={setFilter} onToggle={toggleCompletion} />
          </div>
          <div className="flex-[3] min-w-0 pt-12">
            <DonutChart habits={habits} />
          </div>
        </div>

        <HabitCalendar habits={habits} />
      </div>
    </div>
  );
}

function TopBar({ onSignout }) {
  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-gray-800">Habit Tracker</span>
        </div>
        <button onClick={onSignout} className="cursor-pointer text-[12px] text-gray-400 hover:text-gray-600 transition-colors px-2.5 py-1.5 rounded-md hover:bg-gray-100">
          Sign out
        </button>
      </div>
    </div>
  );
}

function HeroBanner() {
  return (
    <div className="bg-gradient-to-br from-green-100 via-amber-50 to-teal-100">
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        <p className="text-[18px] font-medium italic text-gray-700 max-w-xl mx-auto leading-relaxed">
          "Build better habits, track consistency, and improve your life daily"
        </p>
      </div>
    </div>
  );
}
