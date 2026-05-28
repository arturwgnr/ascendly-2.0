import { PrismaClient } from '@prisma/client';
import { awardXP, updateStreak } from '../services/gamification.service.js';

const prisma = new PrismaClient();

function toDateOnly(d) {
  const dt = d ? new Date(d) : new Date();
  return new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()));
}

// ── Habits ────────────────────────────────────────────────────────────────────

export async function getHabits(req, res, next) {
  try {
    const habits = await prisma.habitDefinition.findMany({
      where: { userId: req.userId, isActive: true },
      orderBy: { order: 'asc' },
    });
    res.json(habits);
  } catch (err) { next(err); }
}

export async function createHabit(req, res, next) {
  try {
    const { name, category, isPositive } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const count = await prisma.habitDefinition.count({ where: { userId: req.userId } });
    const habit = await prisma.habitDefinition.create({
      data: { userId: req.userId, name, category: category || 'Custom', isPositive: isPositive !== false, order: count },
    });
    res.status(201).json(habit);
  } catch (err) { next(err); }
}

export async function updateHabit(req, res, next) {
  try {
    const { id } = req.params;
    const habit = await prisma.habitDefinition.findFirst({ where: { id, userId: req.userId } });
    if (!habit) return res.status(404).json({ error: 'Not found' });
    const updated = await prisma.habitDefinition.update({ where: { id }, data: req.body });
    res.json(updated);
  } catch (err) { next(err); }
}

export async function deleteHabit(req, res, next) {
  try {
    const { id } = req.params;
    const habit = await prisma.habitDefinition.findFirst({ where: { id, userId: req.userId } });
    if (!habit) return res.status(404).json({ error: 'Not found' });
    await prisma.habitDefinition.update({ where: { id }, data: { isActive: false } });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

export async function getHabitLogs(req, res, next) {
  try {
    const date = toDateOnly(req.query.date);
    const nextDay = new Date(date);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    const logs = await prisma.habitLog.findMany({
      where: { userId: req.userId, date: { gte: date, lt: nextDay } },
      include: { habit: true },
    });
    res.json(logs);
  } catch (err) { next(err); }
}

export async function toggleHabitLog(req, res, next) {
  try {
    const { habitId, date, durationMin } = req.body;
    if (!habitId) return res.status(400).json({ error: 'habitId required' });
    const d = toDateOnly(date);
    const nextDay = new Date(d);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const existing = await prisma.habitLog.findFirst({
      where: { userId: req.userId, habitId, date: { gte: d, lt: nextDay } },
    });
    if (existing) {
      await prisma.habitLog.delete({ where: { id: existing.id } });
      return res.json({ logged: false });
    }
    const log = await prisma.habitLog.create({
      data: { userId: req.userId, habitId, date: d, durationMin: durationMin ? Number(durationMin) : null },
    });
    await awardXP(req.userId, 2);
    res.status(201).json({ logged: true, log });
  } catch (err) { next(err); }
}

// ── Missions ──────────────────────────────────────────────────────────────────

export async function getMissions(req, res, next) {
  try {
    const date = toDateOnly(req.query.date);
    const nextDay = new Date(date);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    let missions = await prisma.dailyMission.findMany({
      where: { userId: req.userId, date: { gte: date, lt: nextDay } },
      orderBy: [{ timeSlot: 'asc' }, { order: 'asc' }],
    });

    // Auto-seed from pillars if no missions exist for this date
    if (missions.length === 0) {
      const pillars = await prisma.missionPillar.findMany({
        where: { userId: req.userId, isActive: true },
        orderBy: { order: 'asc' },
      });
      if (pillars.length > 0) {
        await prisma.dailyMission.createMany({
          data: pillars.map(p => ({
            userId: req.userId,
            date,
            pillarId: p.id,
            name: p.name,
            timeSlot: p.timeSlot,
            order: p.order,
          })),
        });
        missions = await prisma.dailyMission.findMany({
          where: { userId: req.userId, date: { gte: date, lt: nextDay } },
          orderBy: [{ timeSlot: 'asc' }, { order: 'asc' }],
        });
      }
    }
    res.json(missions);
  } catch (err) { next(err); }
}

export async function createMission(req, res, next) {
  try {
    const { name, timeSlot, date } = req.body;
    if (!name || !timeSlot) return res.status(400).json({ error: 'name and timeSlot required' });
    const d = toDateOnly(date);
    const count = await prisma.dailyMission.count({ where: { userId: req.userId, date: d, timeSlot } });
    const mission = await prisma.dailyMission.create({
      data: { userId: req.userId, date: d, name, timeSlot, order: count },
    });
    res.status(201).json(mission);
  } catch (err) { next(err); }
}

export async function updateMission(req, res, next) {
  try {
    const { id } = req.params;
    const mission = await prisma.dailyMission.findFirst({ where: { id, userId: req.userId } });
    if (!mission) return res.status(404).json({ error: 'Not found' });

    const wasCompleted = mission.completed;
    const updated = await prisma.dailyMission.update({ where: { id }, data: req.body });

    if (!wasCompleted && updated.completed) {
      await awardXP(req.userId, 5);
    }
    res.json(updated);
  } catch (err) { next(err); }
}

export async function deleteMission(req, res, next) {
  try {
    const { id } = req.params;
    const mission = await prisma.dailyMission.findFirst({ where: { id, userId: req.userId } });
    if (!mission) return res.status(404).json({ error: 'Not found' });
    await prisma.dailyMission.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

// ── Daily Close ────────────────────────────────────────────────────────────────

export async function getDailyClose(req, res, next) {
  try {
    const date = toDateOnly(req.query.date);
    const nextDay = new Date(date);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    const close = await prisma.dailyClose.findFirst({
      where: { userId: req.userId, date: { gte: date, lt: nextDay } },
    });
    res.json(close || null);
  } catch (err) { next(err); }
}

export async function saveDailyClose(req, res, next) {
  try {
    const { dayScore, dayType, comment, date } = req.body;
    if (!dayScore || !dayType) return res.status(400).json({ error: 'dayScore and dayType required' });
    const d = toDateOnly(date);
    const nextDay = new Date(d);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const existing = await prisma.dailyClose.findFirst({
      where: { userId: req.userId, date: { gte: d, lt: nextDay } },
    });

    let close;
    if (existing) {
      close = await prisma.dailyClose.update({
        where: { id: existing.id },
        data: { dayScore: Number(dayScore), dayType, comment: comment || null },
      });
    } else {
      close = await prisma.dailyClose.create({
        data: { userId: req.userId, date: d, dayScore: Number(dayScore), dayType, comment: comment || null },
      });
      await awardXP(req.userId, 10);
      await updateStreak(req.userId, d);
    }
    res.json(close);
  } catch (err) { next(err); }
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function getAnalytics(req, res, next) {
  try {
    const { period } = req.query;
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week': startDate = new Date(now); startDate.setDate(now.getDate() - 7); break;
      case 'month': startDate = new Date(now.getFullYear(), now.getMonth(), 1); break;
      case 'all': startDate = new Date(0); break;
      default: startDate = new Date(now); startDate.setHours(0, 0, 0, 0);
    }

    const [closes, habitLogs, missions] = await Promise.all([
      prisma.dailyClose.findMany({ where: { userId: req.userId, date: { gte: startDate } }, orderBy: { date: 'asc' } }),
      prisma.habitLog.findMany({ where: { userId: req.userId, date: { gte: startDate } }, include: { habit: true } }),
      prisma.dailyMission.findMany({ where: { userId: req.userId, date: { gte: startDate } } }),
    ]);

    // Habit consistency heatmap — last 90 days per habit
    const ninetyAgo = new Date();
    ninetyAgo.setDate(ninetyAgo.getDate() - 90);
    const habitDefs = await prisma.habitDefinition.findMany({ where: { userId: req.userId, isActive: true } });
    const allLogs = await prisma.habitLog.findMany({ where: { userId: req.userId, date: { gte: ninetyAgo } } });
    const habitHeatmaps = habitDefs.map(h => ({
      habit: h,
      dates: allLogs.filter(l => l.habitId === h.id).map(l => l.date.toISOString().split('T')[0]),
    }));

    const avgScore = closes.length ? closes.reduce((a, c) => a + c.dayScore, 0) / closes.length : 0;
    const workDays = closes.filter(c => c.dayType === 'Work Day').length;
    const dayOffs = closes.filter(c => c.dayType !== 'Work Day').length;

    res.json({ closes, habitLogs, missions, habitHeatmaps, avgScore, workDays, dayOffs });
  } catch (err) { next(err); }
}

export async function getGrowthSnapshots(req, res, next) {
  try {
    const snapshots = await prisma.growthSnapshot.findMany({
      where: { userId: req.userId },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });
    res.json(snapshots);
  } catch (err) { next(err); }
}
