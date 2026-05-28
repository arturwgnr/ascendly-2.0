import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BADGE_THRESHOLDS = [
  { id: '50h-studied', label: '50h Studied', check: (g, ctx) => (ctx.totalStudyHours || 0) >= 50 },
  { id: '100h-studied', label: '100h Studied', check: (g, ctx) => (ctx.totalStudyHours || 0) >= 100 },
  { id: '30-day-streak', label: '30 Day Streak', check: (g) => g.streak >= 30 },
  { id: '7-day-streak', label: '7 Day Streak', check: (g) => g.streak >= 7 },
  { id: '10-journal-entries', label: '10 Journal Entries', check: (g, ctx) => (ctx.journalCount || 0) >= 10 },
  { id: '7-day-habit-consistency', label: '7-Day Habit Consistency', check: (g, ctx) => (ctx.habitStreak || 0) >= 7 },
];

export async function awardXP(userId, amount) {
  const gam = await prisma.gamification.findUnique({ where: { userId } });
  if (!gam) return;

  const newXP = gam.xp + amount;
  const newLevel = Math.floor(newXP / 500) + 1;

  await prisma.gamification.update({
    where: { userId },
    data: { xp: newXP, level: newLevel, lastActive: new Date() },
  });
}

export async function updateStreak(userId, date) {
  const gam = await prisma.gamification.findUnique({ where: { userId } });
  if (!gam) return;

  const today = new Date(date);
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  // Check if there was a mission completed yesterday
  const yesterdayClose = await prisma.dailyClose.findFirst({
    where: {
      userId,
      date: { gte: yesterday, lt: today },
    },
  });

  const newStreak = yesterdayClose ? gam.streak + 1 : 1;
  await prisma.gamification.update({
    where: { userId },
    data: { streak: newStreak, lastActive: new Date() },
  });
}
