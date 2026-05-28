import 'dotenv/config';
import app from './app.js';
import cron from 'node-cron';
import { runMonthlySnapshots } from './services/snapshot.service.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Ascendly server running on http://localhost:${PORT}`);
});

// Monthly snapshot job — runs at midnight on the 1st of every month
cron.schedule('0 0 1 * *', async () => {
  console.log('[CRON] Running monthly snapshots...');
  try {
    await runMonthlySnapshots();
    console.log('[CRON] Monthly snapshots complete.');
  } catch (err) {
    console.error('[CRON] Snapshot error:', err);
  }
});
