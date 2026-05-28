export function levelFromXP(xp) {
  return Math.floor(xp / 500) + 1;
}

export function xpForNextLevel(xp) {
  const currentLevel = levelFromXP(xp);
  return currentLevel * 500;
}

export function xpProgress(xp) {
  const xpIntoCurrentLevel = xp % 500;
  return Math.round((xpIntoCurrentLevel / 500) * 100);
}

export const BADGE_META = {
  '7-day-streak':           { label: '7 Day Streak',           icon: 'Flame' },
  '30-day-streak':          { label: '30 Day Streak',          icon: 'Flame' },
  '50h-studied':            { label: '50h Studied',            icon: 'BookOpen' },
  '100h-studied':           { label: '100h Studied',           icon: 'BookOpen' },
  '10-journal-entries':     { label: '10 Journals',            icon: 'PenLine' },
  '7-day-habit-consistency':{ label: '7-Day Habits',           icon: 'Target' },
};
