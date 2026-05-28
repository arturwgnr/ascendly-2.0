import { useEffect, useState, useCallback, useRef } from 'react';
import { Sun, Activity, Moon, Plus, GripVertical, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../services/api.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { todayISO, formatDate } from '../utils/dates.js';
import '../styles/components/growth.css';

const TIME_SLOTS = [
  { key: 'Morning',   icon: Sun,      label: 'Morning' },
  { key: 'Afternoon', icon: Activity, label: 'Afternoon' },
  { key: 'Evening',   icon: Moon,     label: 'Evening' },
];

const DAY_TYPES = ['Work Day', 'Day Off 1', 'Day Off 2', 'Day Off 3'];
const PERIODS = ['today', 'week', 'month', 'all'];
const PERIOD_LABELS = { today: 'Today', week: 'This Week', month: 'This Month', all: 'All Time' };

// Sortable mission item
function SortableMissionItem({ mission, onToggle, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: mission.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className={`mission-item ${mission.completed ? 'completed' : ''} ${isDragging ? 'dragging' : ''}`}>
      <button className={`mission-checkbox ${mission.completed ? 'checked' : ''}`} onClick={() => onToggle(mission)}>
        {mission.completed && <CheckCircle2 size={11} />}
      </button>
      <span className="mission-name">{mission.name}</span>
      <span className="mission-drag-handle" {...attributes} {...listeners}>
        <GripVertical size={14} />
      </span>
      <button className="mission-delete" onClick={() => onDelete(mission.id)}>
        <X size={12} />
      </button>
    </div>
  );
}

// Mission column
function MissionColumn({ slot, missions, onToggle, onDelete, onAdd, onDragEnd }) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const inputRef = useRef(null);
  const Icon = TIME_SLOTS.find(s => s.key === slot)?.icon || Sun;
  const slotMissions = missions.filter(m => m.timeSlot === slot);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleAdd(e) {
    e.preventDefault();
    if (newName.trim()) {
      onAdd(newName.trim(), slot);
      setNewName('');
      setAdding(false);
    }
  }

  return (
    <div className="mission-column">
      <div className="mission-column-header">
        <Icon size={14} />
        {slot}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>
          {slotMissions.filter(m => m.completed).length}/{slotMissions.length}
        </span>
      </div>
      <div className="mission-column-body">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={e => onDragEnd(e, slot)}>
          <SortableContext items={slotMissions.map(m => m.id)} strategy={verticalListSortingStrategy}>
            {slotMissions.map(m => (
              <SortableMissionItem key={m.id} mission={m} onToggle={onToggle} onDelete={onDelete} />
            ))}
          </SortableContext>
        </DndContext>

        {adding ? (
          <form className="mission-add-input-row" onSubmit={handleAdd}>
            <input
              ref={inputRef}
              className="mission-add-input"
              placeholder="Mission name..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              autoFocus
              onBlur={() => { if (!newName.trim()) setAdding(false); }}
            />
            <Button type="submit" variant="primary" size="sm" style={{ padding: '5px 10px' }}>Add</Button>
          </form>
        ) : (
          <button className="mission-add-btn" onClick={() => setAdding(true)}>
            <Plus size={12} /> Add Mission
          </button>
        )}
      </div>
    </div>
  );
}

// Simple analytics bar chart
function ScoreChart({ closes }) {
  if (!closes.length) {
    return <div className="analytics-empty">No data yet — close some days to see your trend.</div>;
  }
  const last = closes.slice(-30);
  const max = 10;
  return (
    <div className="analytics-bar-chart">
      {last.map((c, i) => (
        <div key={c.id || i} className="analytics-bar-col" title={`${c.date?.split('T')[0]}: ${c.dayScore}/10`}>
          <div className="analytics-bar" style={{ height: `${(c.dayScore / max) * 100}%` }} />
          <span className="analytics-bar-score">{c.dayScore}</span>
        </div>
      ))}
    </div>
  );
}

export default function Growth() {
  const { addToast } = useToast();
  const [tab, setTab] = useState('missions');
  const [date] = useState(todayISO());
  const [missions, setMissions] = useState([]);
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [durations, setDurations] = useState({});
  const [dailyClose, setDailyClose] = useState(null);
  const [dayScore, setDayScore] = useState(7);
  const [dayType, setDayType] = useState('Work Day');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  // Analytics state
  const [period, setPeriod] = useState('week');
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const load = useCallback(async () => {
    try {
      const [m, h, hl, dc] = await Promise.all([
        api.get(`/growth/missions?date=${date}`),
        api.get('/growth/habits'),
        api.get(`/growth/habit-logs?date=${date}`),
        api.get(`/growth/daily-close?date=${date}`),
      ]);
      setMissions(m.data);
      setHabits(h.data);
      setHabitLogs(hl.data);
      if (dc.data) {
        setDailyClose(dc.data);
        setDayScore(dc.data.dayScore);
        setDayType(dc.data.dayType);
        setComment(dc.data.comment || '');
      }
    } catch { addToast('Failed to load growth data', 'error'); }
  }, [date, addToast]);

  const loadAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const res = await api.get(`/growth/analytics?period=${period}`);
      setAnalytics(res.data);
    } catch { addToast('Failed to load analytics', 'error'); }
    finally { setLoadingAnalytics(false); }
  }, [period, addToast]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (tab === 'analytics') loadAnalytics(); }, [tab, loadAnalytics]);

  async function toggleMission(mission) {
    setMissions(prev => prev.map(m => m.id === mission.id ? { ...m, completed: !m.completed } : m));
    try {
      await api.put(`/growth/missions/${mission.id}`, { completed: !mission.completed });
    } catch {
      setMissions(prev => prev.map(m => m.id === mission.id ? { ...m, completed: mission.completed } : m));
    }
  }

  async function deleteMission(id) {
    setMissions(prev => prev.filter(m => m.id !== id));
    try { await api.delete(`/growth/missions/${id}`); }
    catch { addToast('Failed to delete mission', 'error'); load(); }
  }

  async function addMission(name, timeSlot) {
    try {
      const res = await api.post('/growth/missions', { name, timeSlot, date });
      setMissions(prev => [...prev, res.data]);
    } catch { addToast('Failed to add mission', 'error'); }
  }

  function handleDragEnd(event, slot) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const slotMissions = missions.filter(m => m.timeSlot === slot);
    const oldIndex = slotMissions.findIndex(m => m.id === active.id);
    const newIndex = slotMissions.findIndex(m => m.id === over.id);
    const reordered = arrayMove(slotMissions, oldIndex, newIndex);
    setMissions(prev => [
      ...prev.filter(m => m.timeSlot !== slot),
      ...reordered,
    ]);
  }

  async function toggleHabit(habit) {
    const isLogged = habitLogs.some(l => l.habitId === habit.id);
    if (isLogged) {
      setHabitLogs(prev => prev.filter(l => l.habitId !== habit.id));
    } else {
      setHabitLogs(prev => [...prev, { habitId: habit.id, habit }]);
    }
    try {
      await api.post('/growth/habit-logs', {
        habitId: habit.id,
        date,
        durationMin: durations[habit.id] ? Number(durations[habit.id]) : null,
      });
    } catch {
      setHabitLogs(prev => isLogged ? [...prev, { habitId: habit.id, habit }] : prev.filter(l => l.habitId !== habit.id));
    }
  }

  // Save progress without closing — repeatable
  async function saveProgress() {
    setSavingProgress(true);
    try {
      await api.post('/growth/daily-close', { dayScore, dayType, comment, date });
      addToast('Progress saved.', 'success');
      load();
    } catch { addToast('Failed to save progress', 'error'); }
    finally { setSavingProgress(false); }
  }

  // Close day — one-time, triggers confirmation first
  async function closeDay() {
    setSaving(true);
    setConfirmClose(false);
    try {
      await api.post('/growth/daily-close', { dayScore, dayType, comment, date });
      addToast('Day closed. Well done.', 'success');
      load();
    } catch { addToast('Failed to close day', 'error'); }
    finally { setSaving(false); }
  }

  const positiveHabits = habits.filter(h => h.isPositive);
  const negativeHabits = habits.filter(h => !h.isPositive);
  const positiveLogged = habitLogs.filter(l => l.habit?.isPositive).length;
  const negativeLogged = habitLogs.filter(l => !l.habit?.isPositive).length;
  const totalHabits = positiveLogged + negativeLogged;

  return (
    <div className="growth-page page-enter">
      <div className="growth-header">
        <div>
          <h2>Personal Growth</h2>
          <p>{formatDate(new Date())}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div className="growth-tabs">
            <button className={`growth-tab ${tab === 'missions' ? 'active' : ''}`} onClick={() => setTab('missions')}>Daily</button>
            <button className={`growth-tab ${tab === 'analytics' ? 'active' : ''}`} onClick={() => setTab('analytics')}>Analytics</button>
          </div>
        </div>
      </div>

      {tab === 'missions' && (
        <>
          {/* Mission columns */}
          <div className="mission-columns">
            {TIME_SLOTS.map(s => (
              <MissionColumn
                key={s.key}
                slot={s.key}
                missions={missions}
                onToggle={toggleMission}
                onDelete={deleteMission}
                onAdd={addMission}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>

          {/* Habits */}
          <div className="habits-section">
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Habit Pulse</h3>
            <div className="habits-groups">
              <Card title="Positive Habits" subtitle="Keep the streak alive">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                  {positiveHabits.map(h => {
                    const logged = habitLogs.some(l => l.habitId === h.id);
                    return (
                      <div key={h.id} className="habit-row positive">
                        <span className="habit-name">{h.name}</span>
                        <div className="habit-right">
                          <input
                            className="habit-duration-input"
                            type="number"
                            min="0"
                            placeholder="min"
                            value={durations[h.id] || ''}
                            onChange={e => setDurations(d => ({ ...d, [h.id]: e.target.value }))}
                          />
                          <button
                            className={`habit-toggle ${logged ? 'checked positive' : ''}`}
                            onClick={() => toggleHabit(h)}
                          >
                            <CheckCircle2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {positiveHabits.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Add habits in Settings.</p>}
                </div>
              </Card>

              <Card title="Negative Habits" subtitle="Break the cycle">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                  {negativeHabits.map(h => {
                    const logged = habitLogs.some(l => l.habitId === h.id);
                    return (
                      <div key={h.id} className="habit-row negative">
                        <span className="habit-name">{h.name}</span>
                        <button
                          className={`habit-toggle ${logged ? 'checked negative' : ''}`}
                          onClick={() => toggleHabit(h)}
                        >
                          <X size={13} style={{ color: logged ? '#fff' : 'var(--text-dim)' }} />
                        </button>
                      </div>
                    );
                  })}
                  {negativeHabits.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Add habits in Settings.</p>}
                </div>
              </Card>
            </div>
          </div>

          {/* Day summary bar */}
          {totalHabits > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                Today: {positiveLogged} positive, {negativeLogged} negative
              </p>
              <div className="day-summary-bar">
                <div className="day-summary-positive" style={{ flex: positiveLogged || 0.01 }} />
                <div className="day-summary-negative" style={{ flex: negativeLogged || 0.01 }} />
              </div>
            </div>
          )}

          {/* Day close */}
          <div className="day-close-section">
            <h3>Close the Day</h3>

            <div className="day-score-slider-wrap">
              <div className="day-score-label">
                <span>Day Rating</span>
                <span className="day-score-value">{dayScore}</span>
              </div>
              <div className="day-score-bars">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <div
                    key={n}
                    className={`day-score-bar ${n <= dayScore ? 'filled' : ''}`}
                    onClick={() => setDayScore(n)}
                  />
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)', marginBottom: 8 }}>Day Type</p>
              <div className="day-type-selector">
                {DAY_TYPES.map(dt => (
                  <button key={dt} className={`day-type-btn ${dayType === dt ? 'active' : ''}`} onClick={() => setDayType(dt)}>{dt}</button>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)', marginBottom: 8 }}>Comment</p>
              <textarea
                className="day-close-textarea"
                placeholder="Anything notable about today..."
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Button variant="secondary" loading={savingProgress} onClick={saveProgress} style={{ alignSelf: 'flex-start' }}>
                Save Progress
              </Button>
              <Button
                variant="primary"
                loading={saving}
                onClick={() => setConfirmClose(true)}
                style={{ alignSelf: 'flex-start' }}
                disabled={!!dailyClose?.closedAt && !savingProgress}
              >
                {dailyClose ? 'Day Closed' : 'Close Day'}
              </Button>
            </div>
          </div>

          {/* Close Day confirmation overlay */}
          {confirmClose && (
            <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setConfirmClose(false); }}>
              <div className="modal" style={{ maxWidth: 400 }}>
                <div className="modal-header">
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={16} color="var(--warning)" /> Close the Day?
                  </h2>
                </div>
                <div className="modal-body">
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    This action records your day as complete. You can still save progress afterwards, but the day-close event is permanent.
                  </p>
                </div>
                <div className="modal-footer">
                  <Button variant="ghost" size="sm" onClick={() => setConfirmClose(false)}>Cancel</Button>
                  <Button variant="primary" size="sm" loading={saving} onClick={closeDay}>Confirm & Close</Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'analytics' && (
        <div className="page-enter">
          {/* Period selector */}
          <div className="growth-tabs" style={{ marginBottom: 24 }}>
            {PERIODS.map(p => (
              <button key={p} className={`growth-tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>

          {loadingAnalytics ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />)}
            </div>
          ) : analytics ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Summary stats */}
              <div className="analytics-stats-row">
                <div className="analytics-stat-card">
                  <div className="analytics-stat-label">Avg Day Score</div>
                  <div className="analytics-stat-value">{analytics.avgScore ? analytics.avgScore.toFixed(1) : '—'}<span>/10</span></div>
                </div>
                <div className="analytics-stat-card">
                  <div className="analytics-stat-label">Days Closed</div>
                  <div className="analytics-stat-value">{analytics.closes?.length ?? 0}</div>
                </div>
                <div className="analytics-stat-card">
                  <div className="analytics-stat-label">Work Days</div>
                  <div className="analytics-stat-value">{analytics.workDays ?? 0}</div>
                </div>
                <div className="analytics-stat-card">
                  <div className="analytics-stat-label">Days Off</div>
                  <div className="analytics-stat-value">{analytics.dayOffs ?? 0}</div>
                </div>
              </div>

              {/* Day score trend */}
              <Card title="Day Score Trend" subtitle="Daily scores over time">
                <div style={{ marginTop: 12 }}>
                  <ScoreChart closes={analytics.closes || []} />
                </div>
              </Card>

              {/* Habit breakdown */}
              <Card title="Habit Activity" subtitle="Log count per habit">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  {analytics.habitHeatmaps && analytics.habitHeatmaps.length > 0 ? (
                    analytics.habitHeatmaps.map(({ habit, dates }) => {
                      const pct = dates.length > 0 ? Math.min(100, Math.round((dates.length / 90) * 100)) : 0;
                      return (
                        <div key={habit.id} className="analytics-habit-row">
                          <span className="analytics-habit-name">{habit.name}</span>
                          <div className="analytics-habit-bar-wrap">
                            <div
                              className={`analytics-habit-bar ${habit.isPositive ? 'positive' : 'negative'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="analytics-habit-count">{dates.length}d</span>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>No habit data for this period.</p>
                  )}
                </div>
              </Card>

              {/* Work/Off breakdown */}
              {(analytics.workDays + analytics.dayOffs) > 0 && (
                <Card title="Day Type Breakdown" subtitle="Work vs rest balance">
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 12 }}>
                    <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--border)', overflow: 'hidden', display: 'flex' }}>
                      <div
                        style={{
                          width: `${(analytics.workDays / (analytics.workDays + analytics.dayOffs)) * 100}%`,
                          background: 'var(--primary)',
                          borderRadius: '4px 0 0 4px',
                          transition: 'width 0.5s var(--ease-out)',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      <span><span style={{ color: 'var(--primary)', fontWeight: 700 }}>{analytics.workDays}</span> work</span>
                      <span><span style={{ color: 'var(--text-dim)', fontWeight: 700 }}>{analytics.dayOffs}</span> off</span>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>
              No data available for this period yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
