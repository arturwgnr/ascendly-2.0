import { PrismaClient } from '@prisma/client';
import { awardXP } from '../services/gamification.service.js';

const prisma = new PrismaClient();

export async function getSessions(req, res, next) {
  try {
    const { month, year } = req.query;
    const where = { userId: req.userId };
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 1);
      where.date = { gte: start, lt: end };
    }
    const sessions = await prisma.studySession.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    res.json(sessions);
  } catch (err) { next(err); }
}

export async function createSession(req, res, next) {
  try {
    const { topic, hours, difficulty, note, date } = req.body;
    if (!topic || !hours || !difficulty) {
      return res.status(400).json({ error: 'topic, hours, difficulty required' });
    }
    const session = await prisma.studySession.create({
      data: {
        userId: req.userId,
        topic,
        hours: Number(hours),
        difficulty: Number(difficulty),
        note: note || null,
        date: date ? new Date(date) : new Date(),
      },
    });
    await awardXP(req.userId, Math.round(Number(hours) * 10));
    res.status(201).json(session);
  } catch (err) { next(err); }
}

export async function updateSession(req, res, next) {
  try {
    const { id } = req.params;
    const data = req.body;
    const session = await prisma.studySession.findFirst({ where: { id, userId: req.userId } });
    if (!session) return res.status(404).json({ error: 'Not found' });
    const updated = await prisma.studySession.update({ where: { id }, data });
    res.json(updated);
  } catch (err) { next(err); }
}

export async function deleteSession(req, res, next) {
  try {
    const { id } = req.params;
    const session = await prisma.studySession.findFirst({ where: { id, userId: req.userId } });
    if (!session) return res.status(404).json({ error: 'Not found' });
    await prisma.studySession.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

export async function getHeatmap(req, res, next) {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const sessions = await prisma.studySession.findMany({
      where: { userId: req.userId, date: { gte: oneYearAgo } },
      select: { date: true, hours: true },
    });
    // Aggregate by date
    const map = {};
    for (const s of sessions) {
      const key = s.date.toISOString().split('T')[0];
      map[key] = (map[key] || 0) + s.hours;
    }
    res.json(Object.entries(map).map(([date, hours]) => ({ date, hours })));
  } catch (err) { next(err); }
}

export async function getStats(req, res, next) {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now);
    const dow = now.getDay(); // 0 = Sunday
    weekStart.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
    weekStart.setHours(0, 0, 0, 0);

    const [monthSessions, weekSessions, allSessions] = await Promise.all([
      prisma.studySession.findMany({ where: { userId: req.userId, date: { gte: monthStart } } }),
      prisma.studySession.findMany({ where: { userId: req.userId, date: { gte: weekStart } } }),
      prisma.studySession.findMany({ where: { userId: req.userId } }),
    ]);

    const monthTotal = monthSessions.reduce((a, s) => a + s.hours, 0);
    const weekTotal = weekSessions.reduce((a, s) => a + s.hours, 0);

    // Weekly average over last 4 weeks
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const recentSessions = allSessions.filter(s => s.date >= fourWeeksAgo);
    const weeklyAvg = recentSessions.reduce((a, s) => a + s.hours, 0) / 4;

    const goal = await prisma.studyGoal.findUnique({
      where: { userId_month_year: { userId: req.userId, month: now.getMonth() + 1, year: now.getFullYear() } },
    });

    res.json({
      monthTotal: Math.round(monthTotal * 10) / 10,
      weekTotal: Math.round(weekTotal * 10) / 10,
      weeklyAvg: Math.round(weeklyAvg * 10) / 10,
      sessionsCount: monthSessions.length,
      goalHours: goal?.targetHours || null,
      goalPercent: goal ? Math.min(100, Math.round((monthTotal / goal.targetHours) * 100)) : null,
    });
  } catch (err) { next(err); }
}

export async function getGoal(req, res, next) {
  try {
    const now = new Date();
    const goal = await prisma.studyGoal.findUnique({
      where: { userId_month_year: { userId: req.userId, month: now.getMonth() + 1, year: now.getFullYear() } },
    });
    res.json(goal || null);
  } catch (err) { next(err); }
}

export async function setGoal(req, res, next) {
  try {
    const { targetHours, month, year } = req.body;
    const hours = Number(targetHours);
    if (!targetHours || isNaN(hours) || hours <= 0) {
      return res.status(400).json({ error: 'targetHours must be a positive number' });
    }
    const now = new Date();
    const m = month ? Number(month) : now.getMonth() + 1;
    const y = year  ? Number(year)  : now.getFullYear();
    const goal = await prisma.studyGoal.upsert({
      where: { userId_month_year: { userId: req.userId, month: m, year: y } },
      update: { targetHours: hours },
      create: { userId: req.userId, month: m, year: y, targetHours: hours },
    });
    res.json(goal);
  } catch (err) {
    console.error('[study] setGoal error:', err?.message || err);
    next(err);
  }
}

export async function getSnapshots(req, res, next) {
  try {
    const snapshots = await prisma.studySnapshot.findMany({
      where: { userId: req.userId },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });
    res.json(snapshots);
  } catch (err) { next(err); }
}
