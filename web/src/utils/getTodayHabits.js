const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getTodayHabits(habits) {
  const today = DAY_NAMES[new Date().getDay()];
  return habits.filter((habit) => habit.schedule.includes(today));
}

export function isCompletedToday(habit) {
  const today = new Date().toISOString().split("T")[0];
  return (habit.completions || []).includes(today);
}
