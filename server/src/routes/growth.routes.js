import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  getHabits, createHabit, updateHabit, deleteHabit,
  getHabitLogs, toggleHabitLog,
  getMissions, createMission, updateMission, deleteMission,
  getDailyClose, saveDailyClose,
  getAnalytics, getGrowthSnapshots,
} from '../controllers/growth.controller.js';

const router = Router();
router.use(requireAuth);
router.get('/habits', getHabits);
router.post('/habits', createHabit);
router.put('/habits/:id', updateHabit);
router.delete('/habits/:id', deleteHabit);
router.get('/habit-logs', getHabitLogs);
router.post('/habit-logs', toggleHabitLog);
router.get('/missions', getMissions);
router.post('/missions', createMission);
router.put('/missions/:id', updateMission);
router.delete('/missions/:id', deleteMission);
router.get('/daily-close', getDailyClose);
router.post('/daily-close', saveDailyClose);
router.get('/analytics', getAnalytics);
router.get('/snapshots', getGrowthSnapshots);
export default router;
