import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function signAccess(userId) {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
}

function signRefresh(userId) {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });
}

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

const DEFAULT_POSITIVE_HABITS = [
  { name: 'Study', category: 'Productivity', isPositive: true, order: 0 },
  { name: 'Reading', category: 'Learning', isPositive: true, order: 1 },
  { name: 'Exercise', category: 'Health', isPositive: true, order: 2 },
  { name: 'Meditation', category: 'Mindfulness', isPositive: true, order: 3 },
  { name: 'Cold shower', category: 'Health', isPositive: true, order: 4 },
];

const DEFAULT_NEGATIVE_HABITS = [
  { name: 'Social media > 1h', category: 'Distraction', isPositive: false, order: 0 },
  { name: 'Sugar', category: 'Health', isPositive: false, order: 1 },
  { name: 'Skipping workout', category: 'Health', isPositive: false, order: 2 },
];

const DEFAULT_PILLARS = [
  { name: 'Morning pages', timeSlot: 'Morning', order: 0, isDefault: true },
  { name: 'Deep work session', timeSlot: 'Morning', order: 1, isDefault: true },
  { name: 'Review goals', timeSlot: 'Evening', order: 0, isDefault: true },
];

export async function register(req, res, next) {
  try {
    const { email, displayName, password } = req.body;
    if (!email || !displayName || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const user = await prisma.user.create({
      data: {
        email,
        displayName,
        passwordHash,
        avatarInitials: initials,
        gamification: { create: {} },
        habitDefs: { create: [...DEFAULT_POSITIVE_HABITS, ...DEFAULT_NEGATIVE_HABITS] },
        missionPillars: { create: DEFAULT_PILLARS },
      },
      select: { id: true, email: true, displayName: true, avatarInitials: true, timezone: true, weekStartDay: true, createdAt: true },
    });

    const accessToken = signAccess(user.id);
    const refreshToken = signRefresh(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

    setRefreshCookie(res, refreshToken);
    res.status(201).json({ accessToken, user });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = signAccess(user.id);
    const refreshToken = signRefresh(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

    setRefreshCookie(res, refreshToken);
    const { passwordHash: _, ...safeUser } = user;
    res.json({ accessToken, user: safeUser });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    const accessToken = signAccess(payload.userId);
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}
