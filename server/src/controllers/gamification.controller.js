import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getGamification(req, res, next) {
  try {
    const gam = await prisma.gamification.findUnique({ where: { userId: req.userId } });
    if (!gam) return res.status(404).json({ error: 'Not found' });
    res.json(gam);
  } catch (err) { next(err); }
}
