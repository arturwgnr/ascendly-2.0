export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatDateShort(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getMondayOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekDays(mondayDate) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mondayDate);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function isToday(date) {
  const d = new Date(date);
  const today = new Date();
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
}

export function daysSince(date) {
  const d = new Date(date);
  const now = new Date();
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}

// Build a 52-week × 7-day grid for heatmap
export function buildHeatmapGrid(dataMap) {
  const grid = [];
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() - endDate.getDay() + 6); // end of current week (Saturday)
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 52 * 7 + 1);

  const current = new Date(startDate);
  let week = [];
  while (current <= endDate) {
    const key = current.toISOString().split('T')[0];
    week.push({ date: key, value: dataMap[key] || 0 });
    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
    current.setDate(current.getDate() + 1);
  }
  if (week.length) grid.push(week);
  return grid;
}

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
