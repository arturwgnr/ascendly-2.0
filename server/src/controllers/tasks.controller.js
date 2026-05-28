import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function toDateOnly(d) {
  if (!d) {
    // Use local date so "today" matches the user's calendar day
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }
  // Pure date strings like "2026-05-24" are parsed as UTC midnight by JS,
  // so getDate() returns the previous calendar day in UTC- timezones.
  // Extract the parts directly from the string to stay timezone-safe.
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [y, mo, day] = d.split('-').map(Number);
    return new Date(Date.UTC(y, mo - 1, day));
  }
  const dt = new Date(d);
  return new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()));
}

export async function getTasks(req, res, next) {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: { allocations: { select: { id: true, date: true } } },
    });
    res.json(tasks);
  } catch (err) { next(err); }
}

export async function createTask(req, res, next) {
  try {
    const { title, description, priority, size, dueDate } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    const task = await prisma.task.create({
      data: {
        userId: req.userId,
        title,
        description: description || null,
        priority: priority || 'Medium',
        size: size || 'Medium',
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });
    res.status(201).json(task);
  } catch (err) { next(err); }
}

export async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const task = await prisma.task.findFirst({ where: { id, userId: req.userId } });
    if (!task) return res.status(404).json({ error: 'Not found' });
    const updated = await prisma.task.update({ where: { id }, data: req.body });
    res.json(updated);
  } catch (err) { next(err); }
}

export async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    const task = await prisma.task.findFirst({ where: { id, userId: req.userId } });
    if (!task) return res.status(404).json({ error: 'Not found' });
    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

export async function getTodayTasks(req, res, next) {
  try {
    const today = toDateOnly(new Date());
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const allocs = await prisma.weeklyTaskAlloc.findMany({
      where: { userId: req.userId, date: { gte: today, lt: tomorrow } },
      include: { task: true },
    });
    res.json(allocs.map(a => ({ ...a.task, allocId: a.id })));
  } catch (err) { next(err); }
}

export async function getWeekAllocations(req, res, next) {
  try {
    const { weekStart } = req.query;
    const start = toDateOnly(weekStart || new Date());
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 7);

    const allocs = await prisma.weeklyTaskAlloc.findMany({
      where: { userId: req.userId, date: { gte: start, lt: end } },
      include: { task: true },
      orderBy: { date: 'asc' },
    });
    res.json(allocs);
  } catch (err) { next(err); }
}

export async function allocateTask(req, res, next) {
  try {
    const { taskId, date } = req.body;
    if (!taskId || !date) return res.status(400).json({ error: 'taskId and date required' });

    const task = await prisma.task.findFirst({ where: { id: taskId, userId: req.userId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const d = toDateOnly(date);
    const alloc = await prisma.weeklyTaskAlloc.upsert({
      where: { taskId_date: { taskId, date: d } },
      update: {},
      create: { userId: req.userId, taskId, date: d },
    });
    res.status(201).json(alloc);
  } catch (err) { next(err); }
}

export async function deallocateTask(req, res, next) {
  try {
    const { allocId } = req.params;
    const alloc = await prisma.weeklyTaskAlloc.findFirst({ where: { id: allocId, userId: req.userId } });
    if (!alloc) return res.status(404).json({ error: 'Not found' });
    await prisma.weeklyTaskAlloc.delete({ where: { id: allocId } });
    res.json({ message: 'Removed' });
  } catch (err) { next(err); }
}
