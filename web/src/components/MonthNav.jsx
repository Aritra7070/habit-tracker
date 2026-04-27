import { getMonthLabel } from "../utils/buildCalendarMonth";

export default function MonthNav({ year, month, onChange }) {
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();
  const isCurrentMonth = year === currentYear && month === currentMonth;
  const isFutureMonth = year > currentYear || (year === currentYear && month > currentMonth);
  const isAtOrAfterCurrentMonth = isCurrentMonth || isFutureMonth;

  function goBack() {
    if (month === 0) {
      onChange(year - 1, 11);
      return;
    }

    onChange(year, month - 1);
  }

  function goForward() {
    if (isAtOrAfterCurrentMonth) {
      return;
    }

    if (month === 11) {
      onChange(year + 1, 0);
      return;
    }

    onChange(year, month + 1);
  }

  function goToday() {
    onChange(currentYear, currentMonth);
  }

  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={goBack}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700"
        aria-label="Previous month"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>

      <div className="flex items-center gap-3">
        <span className="text-[14px] font-semibold text-surface-800">
          {getMonthLabel(year, month)}
        </span>
        {!isAtOrAfterCurrentMonth && (
          <button
            type="button"
            onClick={goToday}
            className="cursor-pointer text-[12px] font-medium text-accent-600 transition-colors hover:text-accent-700"
          >
            Today
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={goForward}
        disabled={isAtOrAfterCurrentMonth}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Next month"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
