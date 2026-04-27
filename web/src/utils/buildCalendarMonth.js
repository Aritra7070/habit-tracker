const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

function formatDateKey(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthDate(year, month, day) {
  return new Date(Date.UTC(year, month, day));
}

function getMonthEndKey(year, month) {
  return formatDateKey(getMonthDate(year, month + 1, 0));
}

function getHabitStartKey(habit) {
  if (!habit.createdAt) return null;
  const createdAt = new Date(habit.createdAt);

  if (Number.isNaN(createdAt.getTime())) return null;
  return formatDateKey(createdAt);
}

export function buildCalendarMonth(year, month, habit) {
  const todayStr = formatDateKey(new Date());
  const completionSet = new Set(habit.completions ?? []);
  const schedule = habit.schedule ?? [];
  const habitStartKey = getHabitStartKey(habit);
  const firstDay = getMonthDate(year, month, 1);
  const startPad = firstDay.getUTCDay();
  const daysInMonth = getMonthDate(year, month + 1, 0).getUTCDate();
  const cells = [];

  for (let index = 0; index < startPad; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = getMonthDate(year, month, day);
    const dateStr = formatDateKey(date);
    const dayName = DAY_NAMES[date.getUTCDay()];

    cells.push({
      dateStr,
      day,
      isCompleted: completionSet.has(dateStr),
      isScheduled: schedule.includes(dayName) && (!habitStartKey || dateStr >= habitStartKey),
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
      isBeforeHabitStart: Boolean(habitStartKey && dateStr < habitStartKey),
      isCurrentMonth: true,
    });
  }

  while (cells.length < 42) {
    cells.push(null);
  }

  return cells;
}

export function habitExistsInMonth(year, month, habit) {
  const habitStartKey = getHabitStartKey(habit);
  return !habitStartKey || habitStartKey <= getMonthEndKey(year, month);
}

export function getMonthLabel(year, month) {
  return MONTH_LABEL_FORMATTER.format(getMonthDate(year, month, 1));
}
