import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

import authRoutes from './routes/auth.routes.js';
import studyRoutes from './routes/study.routes.js';
import growthRoutes from './routes/growth.routes.js';
import tasksRoutes from './routes/tasks.routes.js';
import journalRoutes from './routes/journal.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import gamificationRoutes from './routes/gamification.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/growth', growthRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/gamification', gamificationRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorMiddleware);

export default app;
