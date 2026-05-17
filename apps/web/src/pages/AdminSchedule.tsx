import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWorkoutData } from '../context/WorkoutDataContext';
import { api, type ScheduleDayDto } from '../lib/api';
import { clearSession, getSession, isAdmin } from '../lib/auth';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminSchedulePage() {
  const navigate = useNavigate();
  const { reload, exercises } = useWorkoutData();
  const [days, setDays] = useState<ScheduleDayDto[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [dayType, setDayType] = useState('lower_core');
  const [title, setTitle] = useState('');
  const [exerciseIds, setExerciseIds] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const schedule = await api.weeklySchedule();
      setDays(schedule.days);
      const current = schedule.days.find((d) => d.dayOfWeek === selectedDay) ?? schedule.days[0];
      if (current) {
        setSelectedDay(current.dayOfWeek);
        setDayType(current.dayType);
        setTitle(current.title);
        setExerciseIds(current.exerciseIds.join(', '));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load schedule.');
    } finally {
      setLoading(false);
    }
  }, [selectedDay]);

  useEffect(() => {
    const session = getSession();
    if (!isAdmin(session)) {
      navigate('/admin/login');
      return;
    }
    void load();
  }, [load, navigate]);

  const pickDay = (day: ScheduleDayDto) => {
    setSelectedDay(day.dayOfWeek);
    setDayType(day.dayType);
    setTitle(day.title);
    setExerciseIds(day.exerciseIds.join(', '));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const ids = exerciseIds
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
    try {
      await api.updateScheduleDay(selectedDay, { dayType, title, exerciseIds: ids });
      await load();
      await reload();
      window.alert('Schedule saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    }
  };

  return (
    <div className="app-screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <h1 className="title" style={{ margin: 0 }}>
          Admin · Weekly schedule
        </h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link className="btn-secondary" to="/admin/exercises">
            Exercises
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

      <p className="subtitle" style={{ marginTop: 8 }}>
        Warm-up (exercise #22) is still prepended automatically on workout days.
      </p>

      <div className="dashboard-grid" style={{ marginTop: 14 }}>
        {days.map((day) => (
          <button
            key={day.dayOfWeek}
            type="button"
            className={`glass-card admin-day-card ${selectedDay === day.dayOfWeek ? 'selected' : ''}`}
            onClick={() => pickDay(day)}
          >
            <strong>{DAY_NAMES[day.dayOfWeek]}</strong>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{day.title}</p>
            <p style={{ margin: 0, fontSize: 12 }}>{day.exerciseIds.length} exercises</p>
          </button>
        ))}
      </div>

      <form className="glass-card" style={{ marginTop: 16 }} onSubmit={(e) => void onSubmit(e)}>
        <span className="label">Edit {DAY_NAMES[selectedDay]}</span>
        <label style={{ display: 'block', marginTop: 12 }}>
          Day type
          <input className="input" value={dayType} onChange={(e) => setDayType(e.target.value)} required />
        </label>
        <label style={{ display: 'block', marginTop: 12 }}>
          Title
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label style={{ display: 'block', marginTop: 12 }}>
          Exercise ids (comma-separated)
          <textarea
            className="input"
            rows={3}
            value={exerciseIds}
            onChange={(e) => setExerciseIds(e.target.value)}
            required
          />
        </label>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          Available: {exercises.map((x) => x.id).join(', ')}
        </p>
        {error ? <p style={{ color: 'var(--danger)', marginTop: 12 }}>{error}</p> : null}
        <button type="submit" className="btn-primary" style={{ marginTop: 16 }} disabled={loading}>
          Save day
        </button>
      </form>
    </div>
  );
}
