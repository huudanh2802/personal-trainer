import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWorkoutData } from '../context/WorkoutDataContext';
import { api, type ExerciseDto } from '../lib/api';
import { clearSession, getSession, isAdmin } from '../lib/auth';

const emptyForm = {
  id: '',
  name: '',
  youtubeId: '',
  youtubeTitle: '',
  videoCredit: '',
  videoLoop: true,
  sets: 3,
  reps: '10',
  repGuide: '',
  description: '',
  category: 'Upper Body',
};

export default function AdminExercisesPage() {
  const navigate = useNavigate();
  const { reload } = useWorkoutData();
  const [items, setItems] = useState<ExerciseDto[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setItems(await api.adminExercises());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load exercises.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const session = getSession();
    if (!isAdmin(session)) {
      navigate('/admin/login');
      return;
    }
    void load();
  }, [load, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      const body = {
        ...form,
        id: form.id || undefined,
        sets: Number(form.sets),
      };
      if (editingId) await api.updateExercise(editingId, body);
      else await api.createExercise(body);
      setForm(emptyForm);
      setEditingId(null);
      await load();
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed.');
    }
  };

  const startEdit = (item: ExerciseDto) => {
    setEditingId(item.id);
    setForm({
      id: item.id,
      name: item.name,
      youtubeId: item.youtubeId,
      youtubeTitle: item.youtubeTitle,
      videoCredit: item.videoCredit,
      videoLoop: item.videoLoop,
      sets: item.sets,
      reps: item.reps,
      repGuide: item.repGuide,
      description: item.description,
      category: item.category,
    });
  };

  const onDelete = async (id: string) => {
    if (!window.confirm(`Delete exercise ${id}?`)) return;
    try {
      await api.deleteExercise(id);
      await load();
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  return (
    <div className="app-screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <h1 className="title" style={{ margin: 0 }}>
          Admin · Exercises
        </h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link className="btn-secondary" to="/admin/schedule">
            Schedule
          </Link>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              clearSession();
              navigate('/admin/login');
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      <form className="glass-card" style={{ marginTop: 16 }} onSubmit={(e) => void onSubmit(e)}>
        <span className="label">{editingId ? `Edit ${editingId}` : 'New exercise'}</span>
        <div className="admin-form-grid">
          {!editingId ? (
            <label>
              Id (optional)
              <input
                className="input"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
              />
            </label>
          ) : null}
          <label>
            Name
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label>
            YouTube id
            <input
              className="input"
              value={form.youtubeId}
              onChange={(e) => setForm({ ...form, youtubeId: e.target.value })}
              required
            />
          </label>
          <label>
            Category
            <input
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
          </label>
          <label>
            Sets
            <input
              className="input"
              type="number"
              min={1}
              value={form.sets}
              onChange={(e) => setForm({ ...form, sets: Number(e.target.value) })}
              required
            />
          </label>
          <label>
            Reps
            <input
              className="input"
              value={form.reps}
              onChange={(e) => setForm({ ...form, reps: e.target.value })}
              required
            />
          </label>
        </div>
        <label style={{ display: 'block', marginTop: 12 }}>
          YouTube title
          <input
            className="input"
            value={form.youtubeTitle}
            onChange={(e) => setForm({ ...form, youtubeTitle: e.target.value })}
            required
          />
        </label>
        <label style={{ display: 'block', marginTop: 12 }}>
          Video credit
          <input
            className="input"
            value={form.videoCredit}
            onChange={(e) => setForm({ ...form, videoCredit: e.target.value })}
          />
        </label>
        <label style={{ display: 'block', marginTop: 12 }}>
          Rep guide
          <textarea
            className="input"
            rows={3}
            value={form.repGuide}
            onChange={(e) => setForm({ ...form, repGuide: e.target.value })}
          />
        </label>
        <label style={{ display: 'block', marginTop: 12 }}>
          Description
          <textarea
            className="input"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <label style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={form.videoLoop}
            onChange={(e) => setForm({ ...form, videoLoop: e.target.checked })}
          />
          Loop video
        </label>
        {formError ? <p style={{ color: 'var(--danger)', marginTop: 12 }}>{formError}</p> : null}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button type="submit" className="btn-primary">
            {editingId ? 'Update' : 'Create'}
          </button>
          {editingId ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="glass-card" style={{ marginTop: 16 }}>
        <span className="label">All exercises</span>
        {loadError ? <p style={{ color: 'var(--danger)', marginTop: 8 }}>{loadError}</p> : null}
        {loading ? <p>Loading…</p> : null}
        <ul className="admin-list">
          {items.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>#{item.id}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn-secondary" onClick={() => startEdit(item)}>
                  Edit
                </button>
                <button type="button" className="btn-secondary" onClick={() => void onDelete(item.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
