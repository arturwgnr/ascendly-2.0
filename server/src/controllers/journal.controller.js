import { PrismaClient } from '@prisma/client';
import { awardXP } from '../services/gamification.service.js';
import { analyseWithGroq } from '../services/groq.service.js';

const prisma = new PrismaClient();

export async function getEntries(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const entries = await prisma.journalEntry.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const total = await prisma.journalEntry.count({ where: { userId: req.userId } });
    res.json({ entries, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
}

export async function getEntry(req, res, next) {
  try {
    const entry = await prisma.journalEntry.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!entry) return res.status(404).json({ error: 'Not found' });
    res.json(entry);
  } catch (err) { next(err); }
}

export async function createEntry(req, res, next) {
  try {
    const { content, dayScore } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });
    const entry = await prisma.journalEntry.create({
      data: { userId: req.userId, content, dayScore: dayScore ? Number(dayScore) : null },
    });
    await awardXP(req.userId, 15);
    res.status(201).json(entry);
  } catch (err) { next(err); }
}

export async function updateEntry(req, res, next) {
  try {
    const entry = await prisma.journalEntry.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!entry) return res.status(404).json({ error: 'Not found' });
    const updated = await prisma.journalEntry.update({ where: { id: req.params.id }, data: req.body });
    res.json(updated);
  } catch (err) { next(err); }
}

export async function deleteEntry(req, res, next) {
  try {
    const entry = await prisma.journalEntry.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!entry) return res.status(404).json({ error: 'Not found' });
    await prisma.journalEntry.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

export async function analyseEntry(req, res, next) {
  try {
    const entry = await prisma.journalEntry.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!entry) return res.status(404).json({ error: 'Not found' });
    if (!entry.content || entry.content.length < 20) {
      return res.status(400).json({ error: 'Entry too short to analyse' });
    }

    const analysis = await analyseWithGroq(entry.content);
    const updated = await prisma.journalEntry.update({
      where: { id: entry.id },
      data: { analysis, analysedAt: new Date() },
    });
    res.json({ analysis, analysedAt: updated.analysedAt });
  } catch (err) { next(err); }
}

export async function getHeatmap(req, res, next) {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const entries = await prisma.journalEntry.findMany({
      where: { userId: req.userId, createdAt: { gte: oneYearAgo } },
      select: { createdAt: true, dayScore: true },
      orderBy: { createdAt: 'asc' },
    });
    // One entry per date (latest score wins)
    const map = {};
    for (const e of entries) {
      const key = e.createdAt.toISOString().split('T')[0];
      map[key] = e.dayScore || 5;
    }
    res.json(Object.entries(map).map(([date, score]) => ({ date, score })));
  } catch (err) { next(err); }
}
