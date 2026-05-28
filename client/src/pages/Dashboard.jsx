import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Clock, Award, CheckCircle2, Flame } from 'lucide-react';
import api from '../services/api.js';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import Heatmap from '../components/common/Heatmap.jsx';
import GamificationWidget from '../components/gamification/GamificationWidget.jsx';
import Button from '../components/common/Button.jsx';
import { formatDate, todayISO } from '../utils/dates.js';
import '../styles/components/dashboard.css';
import '../styles/components/gamification.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [close, setClose] = useState(null);
  const [missions, setMissions] = useState([]);
  const [habits, setHabits] = useState({ logs: [], defs: [] });
  const [heatmap, setHeatmap] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = todayISO();
    Promise.all([
      api.get('/study/stats'),
      api.get(`/growth/daily-close?date=${today}`),
      api.get(`/growth/missions?date=${today}`),
      api.get(`/growth/habit-logs?date=${today}`),
      api.get('/study/heatmap'),
      api.get('/tasks/today'),
    ]).then(([statsRes, closeRes, missionsRes, habitLogsRes, heatmapRes, tasksRes]) => {
      setStats(statsRes.data);
      setClose(closeRes.data);
      setMissions(missionsRes.data);
      setHabits({ logs: habitLogsRes.data, defs: [] });
      // Convert heatmap data
      setHeatmap(heatmapRes.data.map(d => ({ date: d.date, value: d.hours })));
      setTodayTasks(tasksRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const completedMissions = missions.filter(m => m.completed).length;
  const positiveLogs = habits.logs.filter(l => l.habit?.isPositive).length;
  const negativeLogs = habits.logs.filter(l => !l.habit?.isPositive).length;

  const goalPercent = stats?.goalPercent || 0;
  const xpPercent = 85; // placeholder until gam widget loads

  return (
    <div className="dashboard page-enter">
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
          {formatDate(new Date())}
        </h2>
      </div>

      {/* Top 3 cards */}
      <div className="dashboard-top-grid">
        {/* Today's summary */}
        <Card title="Today's Summary" subtitle={todayISO()} icon={Activity}>
          <div className="stagger-item" style={{ '--i': 0, animationDelay: '0ms' }}>
            <div className="summary-row">
              <span>Missions Completed</span>
              <span style={{ color: 'var(--success)' }}>{completedMissions} / {missions.length}</span>
            </div>
            <div className="summary-bar">
              <div className="summary-bar-fill" style={{ width: missions.length ? `${(completedMissions / missions.length) * 100}%` : '0%' }} />
            </div>
            <div className="summary-row">
              <span>Habits Logged</span>
              <span style={{ color: 'var(--primary)' }}>{positiveLogs} Good / {negativeLogs} Bad</span>
            </div>
            <div className="summary-row" style={{ marginTop: 8 }}>
              <span>Day Score</span>
              <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                {close?.dayScore ? `${close.dayScore} / 10` : '—'}
              </span>
            </div>
          </div>
        </Card>

        {/* Study progress */}
        <Card title="Study This Week" subtitle={`Goal: ${stats?.goalHours || '—'}h`} icon={Clock}>
          <div className="study-ring-wrap">
            <div className="study-ring">
              <svg viewBox="0 0 96 96" width="88" height="88">
                <circle cx="48" cy="48" r="38" fill="none" stroke="var(--border)" strokeWidth="7" />
                <circle
                  cx="48" cy="48" r="38" fill="none"
                  stroke="var(--primary)" strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - goalPercent / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.8s var(--ease-out)' }}
                />
              </svg>
              <div className="study-ring-label">
                <span className="study-ring-value">{stats?.weekTotal ?? '—'}h</span>
                <span className="study-ring-sub">this week</span>
              </div>
            </div>
            <p className="study-ring-caption">
              {stats?.goalHours ? `${goalPercent}% of monthly goal` : 'Set a goal in Study'}
            </p>
          </div>
        </Card>

        {/* Gamification */}
        <Card title="Current Level" subtitle="XP progress" icon={Award}>
          <GamificationWidget />
        </Card>
      </div>

      {/* Bottom: heatmap + tasks */}
      <div className="dashboard-bottom-grid">
        <Card title="Activity Heatmap" subtitle="All modules — last 12 months">
          <Heatmap data={heatmap} mode="hours" valueLabel="h" />
        </Card>

        <Card title="Today's Tasks" subtitle={`${todayTasks.length} allocated`} icon={CheckCircle2}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
            {todayTasks.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-dim)', textAlign: 'center', padding: '12px 0' }}>
                No tasks allocated for today.
              </p>
            )}
            {todayTasks.map(task => (
              <div key={task.id} className="today-task-item">
                <div className="today-task-top">
                  <span className="today-task-title">{task.title}</span>
                  <Badge>{task.priority}</Badge>
                </div>
                <div className="today-task-size">{task.size}</div>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')} style={{ marginTop: 8, width: '100%' }}>
              View Board
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
