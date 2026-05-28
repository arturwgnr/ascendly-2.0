import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function runMonthlySnapshots() {
  const now = new Date();
  // Snapshot the previous month
  const snapshotMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const snapshotYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  const monthStart = new Date(snapshotYear, snapshotMonth - 1, 1);
  const monthEnd = new Date(snapshotYear, snapshotMonth, 1);

  const users = await prisma.user.findMany({ select: { id: true } });

  for (const { id: userId } of users) {
    await takeStudySnapshot(userId, snapshotMonth, snapshotYear, monthStart, monthEnd);
    await takeGrowthSnapshot(userId, snapshotMonth, snapshotYear, monthStart, monthEnd);
  }
}

async function takeStudySnapshot(userId, month, year, start, end) {
  const sessions = await prisma.studySession.findMany({
    where: { userId, date: { gte: start, lt: end } },
  });
  if (sessions.length === 0) return;

  const totalHours = sessions.reduce((a, s) => a + s.hours, 0);
  const avgDifficulty = sessions.reduce((a, s) => a + s.difficulty, 0) / sessions.length;

  const topicMap = {};
  for (const s of sessions) {
    topicMap[s.topic] = (topicMap[s.topic] || 0) + s.hours;
  }
  const topTopics = Object.entries(topicMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, hours]) => ({ topic, hours }));

  await prisma.studySnapshot.upsert({
    where: { userId_month_year: { userId, month, year } },
    update: { totalHours, avgDifficulty, topTopics, sessionsCount: sessions.length },
    create: { userId, month, year, totalHours, avgDifficulty, topTopics, sessionsCount: sessions.length },
  });
}

async function takeGrowthSnapshot(userId, month, year, start, end) {
  const [closes, habitLogs, habitDefs] = await Promise.all([
    prisma.dailyClose.findMany({ where: { userId, date: { gte: start, lt: end } } }),
    prisma.habitLog.findMany({ where: { userId, date: { gte: start, lt: end } }, include: { habit: true } }),
    prisma.habitDefinition.findMany({ where: { userId } }),
  ]);

  if (closes.length === 0) return;

  const avgDayScore = closes.reduce((a, c) => a + c.dayScore, 0) / closes.length;
  const workDaysCount = closes.filter(c => c.dayType === 'Work Day').length;
  const dayOffCount = closes.filter(c => c.dayType !== 'Work Day').length;

  const positiveMap = {};
  const negativeMap = {};
  for (const log of habitLogs) {
    const target = log.habit.isPositive ? positiveMap : negativeMap;
    if (!target[log.habit.name]) target[log.habit.name] = { name: log.habit.name, count: 0, totalMin: 0 };
    target[log.habit.name].count++;
    target[log.habit.name].totalMin += log.durationMin || 0;
  }

  await prisma.growthSnapshot.upsert({
    where: { userId_month_year: { userId, month, year } },
    update: { avgDayScore, positiveHabits: Object.values(positiveMap), negativeHabits: Object.values(negativeMap), workDaysCount, dayOffCount },
    create: { userId, month, year, avgDayScore, positiveHabits: Object.values(positiveMap), negativeHabits: Object.values(negativeMap), workDaysCount, dayOffCount },
  });
}
