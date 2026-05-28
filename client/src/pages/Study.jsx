import { useEffect, useState, useCallback } from 'react';
import { Plus, Clock, BarChart3 } from 'lucide-react';
import api from '../services/api.js';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Heatmap from '../components/common/Heatmap.jsx';
import Modal from '../components/common/Modal.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDateShort } from '../utils/dates.js';
import '../styles/components/study.css';
import '../styles/components/modal.css';

function DifficultyDots({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1,2,3,4,5].map(d => (
        <button
          key={d}
          type="button"
          onClick={() => onChange(d)}
          style={{
            width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border)',
            background: d <= value ? 'var(--primary)' : 'var(--bg-elevated)',
            cursor: 'pointer', transition: 'all 0.12s ease',
          }}
        />
      ))}
    </div>
  );
}

export default function Study() {
  const { addToast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [stats, setStats] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [goal, setGoal] = useState(null);
  const [goalInput, setGoalInput] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ topic: '', hours: '', difficulty: 3, note: '', date: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);
  const [goalSaving, setGoalSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, hm, st, sn, g] = await Promise.all([
        api.get('/study/sessions'),
        api.get('/study/heatmap'),
        api.get('/study/stats'),
        api.get('/study/snapshots'),
        api.get('/study/goal'),
      ]);
      setSessions(s.data);
      setHeatmap(hm.data.map(d => ({ date: d.date, value: d.hours })));
      setStats(st.data);
      setSnapshots(sn.data);
      setGoal(g.data);
      setGoalInput(g.data?.targetHours || '');
    } catch {
      addToast('Failed to load study data', 'error');
    } finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  async function handleCreateSession(e) {
    e.preventDefault();
    if (!form.topic || !form.hours) return;
    setSaving(true);
    try {
      await api.post('/study/sessions', { ...form, hours: Number(form.hours) });
      setModalOpen(false);
      setForm({ topic: '', hours: '', difficulty: 3, note: '', date: new Date().toISOString().split('T')[0] });
      addToast('Session logged', 'success');
      load();
    } catch {
      addToast('Failed to log session', 'error');
    } finally { setSaving(false); }
  }

  async function handleSaveGoal() {
    const hours = Number(goalInput);
    if (!goalInput || isNaN(hours) || hours <= 0) return;
    setGoalSaving(true);
    try {
      const res = await api.put('/study/goal', { targetHours: hours });
      setGoal(res.data);
      setGoalInput(res.data.targetHours);
      addToast('Goal saved', 'success');
      load(); // refresh stats (goalPercent)
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to save goal';
      addToast(msg, 'error');
    } finally {
      setGoalSaving(false);
    }
  }

  const maxSnapshotHours = snapshots.length ? Math.max(...snapshots.map(s => s.totalHours), 1) : 1;

  return (
    <div className="study-page page-enter">
      <div className="study-header">
        <div>
          <h2>Study Tracker</h2>
          <p>Mastering the art of focus.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>Log Session</Button>
      </div>

      {/* Stats row */}
      <div className="study-stats-grid">
        {[
          { label: 'This Month', value: `${stats?.monthTotal ?? '—'}h`, delta: null },
          { label: 'Monthly Goal', value: `${stats?.goalHours ?? '—'}h`, delta: stats?.goalPercent != null ? `${stats.goalPercent}%` : null },
          { label: 'Weekly Avg', value: `${stats?.weeklyAvg ?? '—'}h`, delta: null },
          { label: 'Sessions', value: stats?.sessionsCount ?? '—', delta: null },
        ].map(s => (
          <div key={s.label} className="study-stat-card">
            <div className="study-stat-label">{s.label}</div>
            <div className="study-stat-value-row">
              <span className="study-stat-value">{s.value}</span>
              {s.delta && <span className={`study-stat-delta ${s.delta.includes('%') ? 'neutral' : 'positive'}`}>{s.delta}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <Card title="Activity Heatmap" subtitle="Focus intensity over 12 months">
        <Heatmap data={heatmap} mode="hours" valueLabel="h" />
      </Card>

      {/* Content grid */}
      <div className="study-content-grid">
        {/* Sessions table */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={14} color="var(--primary)" /> Recent Sessions
          </h3>
          <div className="card">
            <table className="study-sessions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Topic</th>
                  <th style={{ textAlign: 'center' }}>Hours</th>
                  <th style={{ textAlign: 'right' }}>Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {sessions.slice(0, 8).map(s => (
                  <tr key={s.id}>
                    <td>{formatDateShort(s.date)}</td>
                    <td className="muted">{s.topic}</td>
                    <td className="mono" style={{ textAlign: 'center' }}>{s.hours}h</td>
                    <td>
                      <div className="difficulty-dots">
                        {[1,2,3,4,5].map(d => (
                          <div key={d} className={`difficulty-dot ${d <= s.difficulty ? 'filled' : 'empty'}`} />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px 0' }}>No sessions logged yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Monthly chart */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={14} color="var(--primary)" /> Monthly Volume
            </h3>
            <div className="card">
              <div className="study-bar-chart">
                {snapshots.slice(-8).map(s => (
                  <div key={s.id} className="study-bar-col">
                    <div
                      className="study-bar"
                      title={`${s.month}/${s.year}: ${s.totalHours}h`}
                      style={{ height: `${Math.round((s.totalHours / maxSnapshotHours) * 100)}%` }}
                    />
                    <span className="study-bar-label">{['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][s.month]}</span>
                  </div>
                ))}
                {snapshots.length === 0 && (
                  <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 'auto' }}>No snapshots yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Goal panel */}
          <Card title="Monthly Goal">
            <div className="study-goal-panel">
              <div className="study-goal-input-row">
                <input
                  type="number"
                  min="1" max="500"
                  value={goalInput}
                  onChange={e => setGoalInput(e.target.value)}
                  placeholder="60"
                />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>hours target</span>
                <Button variant="ghost" size="sm" loading={goalSaving} onClick={handleSaveGoal}>Save</Button>
              </div>
              <div className="study-goal-progress">
                <div className="study-goal-fill" style={{ width: `${Math.min(100, stats?.goalPercent || 0)}%` }} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {stats?.monthTotal ?? 0}h / {goal?.targetHours ?? '—'}h this month
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Log session modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log Study Session"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={saving} onClick={handleCreateSession}>Log Session</Button>
          </>
        }
      >
        <form onSubmit={handleCreateSession} style={{ display: 'contents' }}>
          <div className="form-group">
            <label className="form-label">Topic</label>
            <input className="form-input" placeholder="What did you study?" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Hours</label>
            <input className="form-input" type="number" min="0.25" max="24" step="0.25" placeholder="2.5" value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Difficulty (1–5)</label>
            <DifficultyDots value={form.difficulty} onChange={v => setForm(f => ({ ...f, difficulty: v }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Note (optional)</label>
            <textarea className="form-textarea" placeholder="Session notes..." value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={3} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
