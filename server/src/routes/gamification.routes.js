import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getGamification } from '../controllers/gamification.controller.js';

const router = Router();
router.use(requireAuth);
router.get('/', getGamification);
export default router;
