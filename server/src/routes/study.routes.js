import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getSessions, createSession, updateSession, deleteSession, getHeatmap, getStats, getGoal, setGoal, getSnapshots } from '../controllers/study.controller.js';

const router = Router();
router.use(requireAuth);
router.get('/sessions', getSessions);
router.post('/sessions', createSession);
router.put('/sessions/:id', updateSession);
router.delete('/sessions/:id', deleteSession);
router.get('/heatmap', getHeatmap);
router.get('/stats', getStats);
router.get('/goal', getGoal);
router.put('/goal', setGoal);
router.get('/snapshots', getSnapshots);
export default router;
