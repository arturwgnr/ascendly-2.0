import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getProfile, updateProfile, uploadAvatar, changePassword, getPillars, createPillar, updatePillar, deletePillar, reorderPillars } from '../controllers/settings.controller.js';

const router = Router();
router.use(requireAuth);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/avatar', uploadAvatar);
router.put('/password', changePassword);
router.get('/pillars', getPillars);
router.post('/pillars', createPillar);
router.put('/pillars/reorder', reorderPillars);
router.put('/pillars/:id', updatePillar);
router.delete('/pillars/:id', deletePillar);
export default router;
