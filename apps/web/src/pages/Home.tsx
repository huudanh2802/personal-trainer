import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { keys, getJson } from '../lib/storage';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function HomePage() {
  const workoutDates = getJson<string[]>(keys.workoutDates, []);
  const todayLogged = useMemo(() => new Set(workoutDates).has(todayKey()), [workoutDates]);
  const streakHint = useMemo(() => {
    const set = new Set(workoutDates);
    return set.has(todayKey()) ? 'You logged a workout today.' : 'No workout logged yet today.';
  }, [workoutDates]);

  return (
    <div className="app-screen">
      <h1 className="title">Home workouts</h1>
      <p className="subtitle">Runs in your browser. Meal logging stays on your phone.</p>

      <div className="dashboard-grid" style={{ marginTop: 20 }}>
        <div className="glass-card">
          <span className="label">This week</span>
          <div className="metric-grid" style={{ marginBottom: 10 }}>
            <div className="metric-card">
              <div className="metric-label">Workout days</div>
              <div className="metric-value">{workoutDates.length}</div>
              <div className="metric-note">Saved in browser</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Today</div>
              <div className="metric-value">{todayLogged ? 'Done' : 'Pending'}</div>
              <div className="metric-note">{todayKey()}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Momentum</div>
              <div className="metric-value">{todayLogged ? 'High' : 'Build'}</div>
              <div className="metric-note">Keep consistency</div>
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            {streakHint}
          </p>
        </div>

        <div className="glass-card">
          <span className="label">Quick actions</span>
          <Link className="btn-primary" to="/workout">
            Start today&apos;s workout
          </Link>
          <Link className="btn-secondary" to="/calendar">
            Performance calendar
          </Link>
          <Link className="btn-secondary" to="/challenges">
            30-day challenges
          </Link>
          <Link className="btn-secondary" to="/tutorials">
            All tutorials &amp; assign exercise
          </Link>
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 24, lineHeight: 1.5 }}>
        Data on this site is stored in your browser (localStorage). It does not include meals from the mobile app unless you
        later wire the calendar to your Azure API.
      </p>
    </div>
  );
}
