import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getTasks, createTask, updateTask, deleteTask, getTodayTasks, getWeekAllocations, allocateTask, deallocateTask } from '../controllers/tasks.controller.js';

const router = Router();
router.use(requireAuth);
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.get('/today', getTodayTasks);
router.get('/week', getWeekAllocations);
router.post('/allocate', allocateTask);
router.delete('/allocate/:allocId', deallocateTask);
export default router;
