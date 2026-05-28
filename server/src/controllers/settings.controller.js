import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PROFILE_SELECT = {
  id: true, email: true, displayName: true, avatarInitials: true,
  avatarUrl: true, timezone: true, weekStartDay: true, createdAt: true,
};

export async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: PROFILE_SELECT });
    res.json(user);
  } catch (err) { next(err); }
}

export async function uploadAvatar(req, res, next) {
  try {
    const { avatarDataUrl } = req.body;
    if (!avatarDataUrl || !avatarDataUrl.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image data' });
    }
    // Limit to ~500 KB base64
    if (avatarDataUrl.length > 700_000) {
      return res.status(400).json({ error: 'Image too large. Max ~500 KB.' });
    }
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { avatarUrl: avatarDataUrl },
      select: PROFILE_SELECT,
    });
    res.json(user);
  } catch (err) { next(err); }
}

export async function updateProfile(req, res, next) {
  try {
    const { displayName, timezone, weekStartDay } = req.body;
    const data = {};
    if (displayName) {
      data.displayName = displayName;
      data.avatarInitials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (timezone) data.timezone = timezone;
    if (weekStartDay) data.weekStartDay = weekStartDay;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: PROFILE_SELECT,
    });
    res.json(user);
  } catch (err) { next(err); }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Current password incorrect' });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.userId }, data: { passwordHash } });
    res.json({ message: 'Password updated' });
  } catch (err) { next(err); }
}

export async function getPillars(req, res, next) {
  try {
    const pillars = await prisma.missionPillar.findMany({
      where: { userId: req.userId, isActive: true },
      orderBy: [{ timeSlot: 'asc' }, { order: 'asc' }],
    });
    res.json(pillars);
  } catch (err) { next(err); }
}

export async function createPillar(req, res, next) {
  try {
    const { name, timeSlot } = req.body;
    if (!name || !timeSlot) return res.status(400).json({ error: 'name and timeSlot required' });
    const count = await prisma.missionPillar.count({ where: { userId: req.userId, timeSlot } });
    const pillar = await prisma.missionPillar.create({
      data: { userId: req.userId, name, timeSlot, order: count },
    });
    res.status(201).json(pillar);
  } catch (err) { next(err); }
}

export async function updatePillar(req, res, next) {
  try {
    const { id } = req.params;
    const pillar = await prisma.missionPillar.findFirst({ where: { id, userId: req.userId } });
    if (!pillar) return res.status(404).json({ error: 'Not found' });
    const updated = await prisma.missionPillar.update({ where: { id }, data: req.body });
    res.json(updated);
  } catch (err) { next(err); }
}

export async function deletePillar(req, res, next) {
  try {
    const { id } = req.params;
    const pillar = await prisma.missionPillar.findFirst({ where: { id, userId: req.userId } });
    if (!pillar) return res.status(404).json({ error: 'Not found' });
    await prisma.missionPillar.update({ where: { id }, data: { isActive: false } });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

export async function reorderPillars(req, res, next) {
  try {
    const { items } = req.body; // [{id, order}]
    await Promise.all(
      items.map(({ id, order }) =>
        prisma.missionPillar.updateMany({ where: { id, userId: req.userId }, data: { order } })
      )
    );
    res.json({ message: 'Reordered' });
  } catch (err) { next(err); }
}
