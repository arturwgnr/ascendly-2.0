import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getEntries, getEntry, createEntry, updateEntry, deleteEntry, analyseEntry, getHeatmap } from '../controllers/journal.controller.js';

const router = Router();
router.use(requireAuth);
router.get('/', getEntries);
router.get('/heatmap', getHeatmap);
router.get('/:id', getEntry);
router.post('/', createEntry);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);
router.post('/:id/analyse', analyseEntry);
export default router;
