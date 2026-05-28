import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Zap, Activity, CheckCircle2, Circle } from 'lucide-react';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  pointerWithin, useDraggable, useDroppable,
} from '@dnd-kit/core';
import api from '../services/api.js';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Modal from '../components/common/Modal.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getMondayOfWeek, getWeekDays, isToday, daysSince, formatDateShort } from '../utils/dates.js';
import '../styles/components/tasks.css';
import '../styles/components/modal.css';

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const SIZES = ['Quick', 'Medium', 'Large'];

function TaskCard({ task, compact = false, isDragging = false, onComplete }) {
  const age = daysSince(task.createdAt);
  const ageClass = age > 7 ? 'danger' : age > 3 ? 'amber' : 'fresh';
  const isDone = task.status === 'Done';
  return (
    <div className={`task-card ${compact ? 'compact' : ''} ${isDragging ? 'dragging' : ''} ${isDone ? 'done' : ''}`}>
      <div className="task-card-top">
        {onComplete && (
          <button
            className={`task-complete-btn ${isDone ? 'completed' : ''}`}
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onComplete(task); }}
            title={isDone ? 'Mark incomplete' : 'Mark complete'}
            aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
          >
            {isDone ? <CheckCircle2 size={14} /> : <Circle size={14} />}
          </button>
        )}
        <span className="task-card-title">{task.title}</span>
        <Badge>{task.priority}</Badge>
      </div>
      <div className="task-card-bottom">
        <span className="task-card-size">
          <Zap size={11} /> {task.size}
        </span>
        <span className={`task-card-age ${ageClass}`}>{age}d old</span>
      </div>
    </div>
  );
}

function DraggableTaskCard({ task, onDoubleClick, onComplete }) {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({ id: task.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 999, position: 'relative' }
    : {};
  return (
    <div
      ref={setNodeRef}
      style={{ ...style, opacity: isDragging ? 0 : 1 }}
      {...attributes}
      {...listeners}
      onDoubleClick={onDoubleClick}
    >
      <TaskCard task={task} onComplete={onComplete} />
    </div>
  );
}

function DroppableDayCol({ dayKey, today, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: `day-${dayKey}` });
  return (
    <div
      ref={setNodeRef}
      id={`day-${dayKey}`}
      className={`week-day-col ${today ? 'today' : ''} ${isOver ? 'drag-over' : ''}`}
    >
      {children}
    </div>
  );
}

export default function Tasks() {
  const { addToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [allocs, setAllocs] = useState([]);
  const [search, setSearch] = useState('');
  const [weekStart] = useState(() => getMondayOfWeek());
  const [weekDays] = useState(() => getWeekDays(getMondayOfWeek()));
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', size: 'Medium', dueDate: '' });
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const load = useCallback(async () => {
    try {
      const [t, a] = await Promise.all([
        api.get('/tasks'),
        api.get(`/tasks/week?weekStart=${weekStart.toISOString()}`),
      ]);
      setTasks(t.data);
      setAllocs(a.data);
    } catch { addToast('Failed to load tasks', 'error'); }
  }, [weekStart, addToast]);

  useEffect(() => { load(); }, [load]);

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editTask) {
        await api.put(`/tasks/${editTask.id}`, form);
      } else {
        await api.post('/tasks', form);
      }
      setModalOpen(false);
      setEditTask(null);
      setForm({ title: '', description: '', priority: 'Medium', size: 'Medium', dueDate: '' });
      addToast(editTask ? 'Task updated' : 'Task created', 'success');
      load();
    } catch { addToast('Failed to save task', 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(taskId) {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      addToast('Task deleted', 'success');
      load();
    } catch { addToast('Failed to delete task', 'error'); }
  }

  async function handleComplete(task) {
    const newStatus = task.status === 'Done' ? 'Todo' : 'Done';
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    try {
      await api.put(`/tasks/${task.id}`, { status: newStatus });
    } catch {
      // Roll back on failure
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: task.status } : t));
      addToast('Failed to update task', 'error');
    }
  }

  function openEdit(task) {
    setEditTask(task);
    setForm({ title: task.title, description: task.description || '', priority: task.priority, size: task.size, dueDate: task.dueDate ? task.dueDate.split('T')[0] : '' });
    setModalOpen(true);
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const overId = over.id;
    if (typeof overId === 'string' && overId.startsWith('day-')) {
      const dayDate = overId.replace('day-', '');
      try {
        await api.post('/tasks/allocate', { taskId: active.id, date: dayDate });
        addToast('Task allocated', 'success');
        load();
      } catch { addToast('Failed to allocate task', 'error'); }
    }
  }

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
  const activeTasks = filteredTasks.filter(t => t.status !== 'Done');
  const doneTasks = filteredTasks.filter(t => t.status === 'Done');
  const activeTask = tasks.find(t => t.id === activeId);

  return (
    <div className="tasks-page page-enter">
      <div className="tasks-header">
        <div className="tasks-header-left">
          <h2>Task Flow</h2>
          <p>Aligning backlog with execution.</p>
        </div>
        <div className="tasks-header-right">
          <div className="tasks-search-wrap">
            <Search className="tasks-search-icon" />
            <input className="tasks-search" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button variant="primary" icon={Plus} size="sm" onClick={() => { setEditTask(null); setForm({ title: '', description: '', priority: 'Medium', size: 'Medium', dueDate: '' }); setModalOpen(true); }}>
            New Task
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={e => setActiveId(e.active.id)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="tasks-board">
          {/* Backlog */}
          <div className="task-column">
            <div className="task-column-header">
              <div className="task-column-title">
                <Activity size={14} /> Backlog
                <span className="task-column-count">{activeTasks.length}</span>
              </div>
            </div>
            <div className="task-column-body">
              {activeTasks.map(task => (
                <DraggableTaskCard
                  key={task.id}
                  task={task}
                  onDoubleClick={() => openEdit(task)}
                  onComplete={handleComplete}
                />
              ))}
              {activeTasks.length === 0 && doneTasks.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>
                  No tasks. Create one above.
                </p>
              )}

              {/* Done section */}
              {doneTasks.length > 0 && (
                <div className="task-done-section">
                  <div className="task-done-divider">
                    Completed — {doneTasks.length}
                  </div>
                  {doneTasks.map(task => (
                    <div key={task.id} className="task-done-item" onDoubleClick={() => openEdit(task)}>
                      <TaskCard task={task} onComplete={handleComplete} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Weekly board */}
          <div className="task-column" style={{ background: 'transparent', border: 'none' }}>
            <div className="task-column-header" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', border: '1px solid var(--border)' }}>
              <div className="task-column-title">This Week's Plan</div>
            </div>
            <div className="weekly-board" style={{ border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 var(--radius-md) var(--radius-md)', background: 'rgba(240,234,224,0.02)', flex: 1 }}>
              {weekDays.map(day => {
                const dayKey = day.toISOString().split('T')[0];
                const dayAllocs = allocs.filter(a => a.date?.split('T')[0] === dayKey);
                return (
                  <DroppableDayCol key={dayKey} dayKey={dayKey} today={isToday(day)}>
                    <div className="week-day-header">
                      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][day.getDay() === 0 ? 6 : day.getDay() - 1]}
                      {isToday(day) && <span style={{ display: 'block', fontSize: 8, color: 'var(--primary)', marginTop: 2 }}>TODAY</span>}
                    </div>
                    <div className="week-day-body">
                      {dayAllocs.map(a => {
                        const isDone = a.task?.status === 'Done';
                        return (
                          <div key={a.id} className={`week-allocated-task ${isDone ? 'done' : ''}`}>
                            <div className="week-allocated-task-title" style={isDone ? { textDecoration: 'line-through', opacity: 0.5 } : {}}>
                              {a.task?.title}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                              <Badge>{a.task?.priority}</Badge>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <button
                                  className={`week-task-complete-btn ${isDone ? 'done' : ''}`}
                                  onClick={() => a.task && handleComplete(a.task)}
                                  title={isDone ? 'Undo' : 'Mark done'}
                                >
                                  {isDone ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                                </button>
                                <button
                                  onClick={() => api.delete(`/tasks/allocate/${a.id}`).then(load).catch(() => addToast('Failed', 'error'))}
                                  style={{ fontSize: 10, color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: '1px 4px', borderRadius: 3 }}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {dayAllocs.length === 0 && (
                        <div className="week-empty-drop">
                          <p>Drop task here</p>
                        </div>
                      )}
                    </div>
                  </DroppableDayCol>
                );
              })}
            </div>
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      {/* Create/Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTask ? 'Edit Task' : 'New Task'}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            {editTask && <Button variant="danger" size="sm" onClick={() => { handleDelete(editTask.id); setModalOpen(false); }}>Delete</Button>}
            <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
              {editTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: 'contents' }}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" placeholder="Task title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea className="form-textarea" rows={2} placeholder="Details..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Size</label>
              <select className="form-select" value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))}>
                {SIZES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Due Date (optional)</label>
            <input className="form-input" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
