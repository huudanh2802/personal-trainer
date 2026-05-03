import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { workoutPlan } from '../data/exercises';
import { keys, getJson, setJson } from '../lib/storage';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function TutorialsPage() {
  const [searchParams] = useSearchParams();
  const targetDate = searchParams.get('date') || todayKey();
  const [assigningId, setAssigningId] = useState('');
  const title = useMemo(
    () => (searchParams.get('date') ? `Tutorials for ${targetDate}` : 'All tutorials'),
    [searchParams, targetDate]
  );

  const assignExercise = async (exerciseId: string) => {
    setAssigningId(exerciseId);
    try {
      const map = getJson<Record<string, string>>(keys.dailyExercisePlan, {});
      map[targetDate] = String(exerciseId);
      setJson(keys.dailyExercisePlan, map);
      window.alert(`Saved for ${targetDate}. The workout screen will use this exercise.`);
    } catch {
      window.alert('Could not save assignment.');
    } finally {
      setAssigningId('');
    }
  };

  return (
    <div className="app-screen">
      <h1 className="title">{title}</h1>
      <p className="subtitle">Choose any tutorial and tap assign. You can reassign anytime.</p>

      <div className="dashboard-grid" style={{ marginTop: 14 }}>
        {workoutPlan.map((item) => (
          <div key={item.id} className="glass-card">
            <span
              style={{
                display: 'inline-block',
                color: 'var(--accent)',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                background: 'var(--accent-soft)',
                padding: '4px 10px',
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              {item.category}
            </span>
            <h2 style={{ margin: '4px 0', fontSize: 20 }}>{item.name}</h2>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0' }}>
              {item.sets} sets · {typeof item.reps === 'number' ? `${item.reps} reps` : item.reps}
            </p>
            <p style={{ lineHeight: 1.45 }}>{item.description}</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>YouTube: {item.youtubeTitle}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.videoCredit}</p>
            <button
              type="button"
              className="btn-secondary"
              style={{ marginTop: 12 }}
              disabled={assigningId === item.id}
              onClick={() => void assignExercise(item.id)}
            >
              {assigningId === item.id ? 'Saving…' : `Assign to ${targetDate}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
