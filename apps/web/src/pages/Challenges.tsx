import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { challengePlans, type ChallengeState } from '../data/challenges';
import { keys } from '../lib/storage';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ChallengesPage() {
  const [state, setState] = useState<ChallengeState | null>(null);

  const load = useCallback(() => {
    try {
      const raw = localStorage.getItem(keys.challengeState);
      if (!raw) {
        setState(null);
        return;
      }
      setState(JSON.parse(raw) as ChallengeState);
    } catch {
      setState(null);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startPlan = async (planId: string) => {
    const next: ChallengeState = {
      planId,
      startedOn: todayKey(),
      currentDay: 1,
      completedDays: [],
    };
    localStorage.setItem(keys.challengeState, JSON.stringify(next));
    setState(next);
    window.alert('Plan started. Your 30-day challenge is now active.');
  };

  const resetPlan = async () => {
    localStorage.removeItem(keys.challengeState);
    setState(null);
    window.alert('Challenge progress was cleared.');
  };

  const activePlan = state ? challengePlans.find((p) => p.id === state.planId) : null;

  return (
    <div className="app-screen">
      <h1 className="title">30-day challenge</h1>
      <p className="subtitle">Structured plans from basic to premium-style progression.</p>

      <div className="glass-card" style={{ marginTop: 16 }}>
        <span className="label">Active challenge</span>
        {activePlan ? (
          <>
            <h2 style={{ margin: '4px 0' }}>{activePlan.title}</h2>
            <p style={{ color: 'var(--text-muted)' }}>Day {state?.currentDay ?? 1} / 30</p>
            <p style={{ color: 'var(--text-muted)' }}>Completed days: {state?.completedDays.length ?? 0}</p>
            <Link className="btn-primary" style={{ marginTop: 12 }} to="/workout">
              Start today&apos;s challenge workout
            </Link>
            <button type="button" className="btn-secondary" style={{ marginTop: 12 }} onClick={() => void resetPlan()}>
              Reset challenge
            </button>
          </>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No active plan. Pick one below.</p>
        )}
      </div>

      <div className="dashboard-grid" style={{ marginTop: 14 }}>
        {challengePlans.map((plan) => (
          <div key={plan.id} className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>{plan.title}</h2>
              {plan.premium ? (
                <span style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 700 }}>Premium</span>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Basic</span>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.45 }}>{plan.description}</p>
            <p style={{ fontSize: 13 }}>Target: {plan.target}</p>
            <button type="button" className="btn-secondary" style={{ marginTop: 8 }} onClick={() => void startPlan(plan.id)}>
              Select this plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
