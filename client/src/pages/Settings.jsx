import { useEffect, useState, useCallback, useRef } from 'react';
import { User, Zap, Plus, X, Lock, Camera } from 'lucide-react';
import api from '../services/api.js';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import '../styles/components/settings.css';
import '../styles/components/modal.css';

const TIMEZONES = ['UTC', 'UTC+1 (Paris)', 'UTC+2 (Cairo)', 'UTC-5 (New York)', 'UTC-8 (Los Angeles)', 'UTC+5:30 (Mumbai)', 'UTC+8 (Singapore)', 'UTC+9 (Tokyo)'];
const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening'];

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({ displayName: '', timezone: 'UTC', weekStartDay: 'Mon' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [pillars, setPillars] = useState([]);
  const [habits, setHabits] = useState([]);
  const [newPillar, setNewPillar] = useState({ name: '', timeSlot: 'Morning' });
  const [newHabit, setNewHabit] = useState({ name: '', category: 'Custom', isPositive: true });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const load = useCallback(async () => {
    try {
      const [pr, pi, hb] = await Promise.all([
        api.get('/settings/profile'),
        api.get('/settings/pillars'),
        api.get('/growth/habits'),
      ]);
      setProfile({ displayName: pr.data.displayName, timezone: pr.data.timezone, weekStartDay: pr.data.weekStartDay });
      setPillars(pi.data);
      setHabits(hb.data);
    } catch { addToast('Failed to load settings', 'error'); }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  async function saveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/settings/profile', profile);
      updateUser(res.data);
      addToast('Profile saved', 'success');
    } catch { addToast('Failed to save profile', 'error'); }
    finally { setSavingProfile(false); }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) { addToast('Passwords do not match', 'error'); return; }
    if (passwords.newPass.length < 8) { addToast('Password must be at least 8 characters', 'error'); return; }
    setSavingPw(true);
    try {
      await api.put('/settings/password', { currentPassword: passwords.current, newPassword: passwords.newPass });
      setPasswords({ current: '', newPass: '', confirm: '' });
      addToast('Password changed', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to change password', 'error');
    } finally { setSavingPw(false); }
  }

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { addToast('Please select an image file', 'error'); return; }

    setUploadingAvatar(true);
    try {
      // Resize to max 200×200 using canvas, then convert to base64
      const dataUrl = await resizeImage(file, 200);
      const res = await api.post('/settings/avatar', { avatarDataUrl: dataUrl });
      updateUser(res.data);
      addToast('Profile photo updated', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to upload photo', 'error');
    } finally {
      setUploadingAvatar(false);
      // Reset input so same file can be re-selected
      e.target.value = '';
    }
  }

  function resizeImage(file, maxSize) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
          canvas.width = Math.round(img.width * ratio);
          canvas.height = Math.round(img.height * ratio);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = reject;
        img.src = ev.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function addPillar() {
    if (!newPillar.name.trim()) return;
    try {
      const res = await api.post('/settings/pillars', newPillar);
      setPillars(p => [...p, res.data]);
      setNewPillar({ name: '', timeSlot: 'Morning' });
      addToast('Pillar added', 'success');
    } catch { addToast('Failed to add pillar', 'error'); }
  }

  async function deletePillar(id) {
    setPillars(p => p.filter(x => x.id !== id));
    try { await api.delete(`/settings/pillars/${id}`); }
    catch { addToast('Failed to delete pillar', 'error'); load(); }
  }

  async function addHabit() {
    if (!newHabit.name.trim()) return;
    try {
      const res = await api.post('/growth/habits', newHabit);
      setHabits(h => [...h, res.data]);
      setNewHabit({ name: '', category: 'Custom', isPositive: true });
      addToast('Habit added', 'success');
    } catch { addToast('Failed to add habit', 'error'); }
  }

  async function deleteHabit(id) {
    setHabits(h => h.filter(x => x.id !== id));
    try { await api.delete(`/growth/habits/${id}`); }
    catch { addToast('Failed to delete habit', 'error'); load(); }
  }

  async function toggleHabitType(habit) {
    const updated = { ...habit, isPositive: !habit.isPositive };
    setHabits(h => h.map(x => x.id === habit.id ? updated : x));
    try { await api.put(`/growth/habits/${habit.id}`, { isPositive: !habit.isPositive }); }
    catch { addToast('Failed to update habit', 'error'); load(); }
  }

  return (
    <div className="settings-page page-enter">
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Customize your growth machine.</p>
      </div>

      <div className="settings-grid">
        {/* Profile */}
        <div className="settings-section">
          <h3 className="settings-section-title"><User size={17} /> Profile & Account</h3>
          <Card>
            <div className="settings-avatar-block">
              {/* Clickable avatar with photo support */}
              <div className="settings-avatar" onClick={handleAvatarClick} title="Click to change photo">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Profile" className="settings-avatar-img" />
                ) : (
                  user?.avatarInitials || '?'
                )}
                <div className="settings-avatar-overlay">
                  {uploadingAvatar ? <span style={{ fontSize: 10 }}>...</span> : <Camera size={14} />}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
              <div className="settings-user-info">
                <h4>{user?.displayName}</h4>
                <p>Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                <Badge variant="success">Active</Badge>
              </div>
            </div>

            <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input className="form-input" value={profile.displayName} onChange={e => setProfile(p => ({ ...p, displayName: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" value={user?.email || ''} readOnly style={{ opacity: 0.6 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Timezone</label>
                  <select className="form-select" value={profile.timezone} onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}>
                    {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Week Start</label>
                  <select className="form-select" value={profile.weekStartDay} onChange={e => setProfile(p => ({ ...p, weekStartDay: e.target.value }))}>
                    <option value="Mon">Monday</option>
                    <option value="Sun">Sunday</option>
                  </select>
                </div>
              </div>
              <Button type="submit" variant="primary" size="sm" loading={savingProfile} style={{ alignSelf: 'flex-start' }}>
                Save Profile
              </Button>
            </form>
          </Card>

          {/* Password */}
          <h3 className="settings-section-title" style={{ marginTop: 8 }}><Lock size={17} /> Change Password</h3>
          <Card>
            <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-input" type="password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" value={passwords.newPass} onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-input" type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} />
              </div>
              <Button type="submit" variant="secondary" size="sm" loading={savingPw} style={{ alignSelf: 'flex-start' }}>
                Change Password
              </Button>
            </form>
          </Card>
        </div>

        {/* App settings */}
        <div className="settings-section">
          <h3 className="settings-section-title"><Zap size={17} /> Pillars & Habits</h3>

          <Card>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Growth Pillars</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
              These seed your daily missions automatically every morning.
            </p>

            <div className="pillars-list">
              {pillars.map(p => (
                <div key={p.id} className="pillar-item">
                  <span className="pillar-item-name">{p.name}</span>
                  <span className="pillar-item-slot">{p.timeSlot}</span>
                  <button className="pillar-delete" onClick={() => deletePillar(p.id)}>Delete</button>
                </div>
              ))}
              {pillars.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>No pillars yet.</p>}
            </div>

            <div className="settings-add-row" style={{ marginTop: 12 }}>
              <input
                className="settings-add-input"
                placeholder="New pillar name..."
                value={newPillar.name}
                onChange={e => setNewPillar(p => ({ ...p, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addPillar()}
              />
              <select className="settings-add-select" value={newPillar.timeSlot} onChange={e => setNewPillar(p => ({ ...p, timeSlot: e.target.value }))}>
                {TIME_SLOTS.map(s => <option key={s}>{s}</option>)}
              </select>
              <Button variant="primary" size="sm" icon={Plus} onClick={addPillar}>Add</Button>
            </div>
          </Card>

          <Card style={{ marginTop: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Habit Manager</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
              Add, remove, and toggle positive/negative classification.
            </p>

            <div className="habit-manager-list">
              {habits.map(h => (
                <div key={h.id} className="habit-manager-item">
                  <span className="habit-manager-name">{h.name}</span>
                  <span className="habit-manager-category">{h.category}</span>
                  <div className="habit-type-toggle">
                    <button
                      className={`habit-type-btn ${h.isPositive ? 'active-positive' : ''}`}
                      onClick={() => !h.isPositive && toggleHabitType(h)}
                    >+</button>
                    <button
                      className={`habit-type-btn ${!h.isPositive ? 'active-negative' : ''}`}
                      onClick={() => h.isPositive && toggleHabitType(h)}
                    >−</button>
                  </div>
                  <button
                    onClick={() => deleteHabit(h.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '2px 6px', borderRadius: 4, fontSize: 12, transition: 'color 0.12s ease' }}
                    onMouseEnter={e => e.target.style.color = 'var(--danger)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-dim)'}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              {habits.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>No habits yet.</p>}
            </div>

            <div className="settings-add-row" style={{ marginTop: 12 }}>
              <input
                className="settings-add-input"
                placeholder="Habit name..."
                value={newHabit.name}
                onChange={e => setNewHabit(h => ({ ...h, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addHabit()}
              />
              <input
                className="settings-add-input"
                placeholder="Category"
                style={{ maxWidth: 100 }}
                value={newHabit.category}
                onChange={e => setNewHabit(h => ({ ...h, category: e.target.value }))}
              />
              <div className="habit-type-toggle">
                <button className={`habit-type-btn ${newHabit.isPositive ? 'active-positive' : ''}`} onClick={() => setNewHabit(h => ({ ...h, isPositive: true }))}>+</button>
                <button className={`habit-type-btn ${!newHabit.isPositive ? 'active-negative' : ''}`} onClick={() => setNewHabit(h => ({ ...h, isPositive: false }))}>−</button>
              </div>
              <Button variant="primary" size="sm" icon={Plus} onClick={addHabit}>Add</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
