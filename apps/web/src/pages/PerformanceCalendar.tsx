import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutPlan } from '../data/exercises';
import { challengePlans, type ChallengeState } from '../data/challenges';
import { keys } from '../lib/storage';

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type NumberByDate = Record<string, number | undefined>;

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function firstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthTitle(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function parseObject<T extends Record<string, unknown>>(raw: string | null): T {
  if (!raw) return {} as T;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as T;
  } catch {
    return {} as T;
  }
  return {} as T;
}

function getWeekRange(date: Date): { start: Date; end: Date } {
  const current = new Date(date);
  current.setHours(12, 0, 0, 0);
  const day = current.getDay();
  const offsetToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(current);
  start.setDate(current.getDate() + offsetToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function countWorkoutInRange(workoutSet: Set<string>, start: Date, end: Date): number {
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    if (workoutSet.has(dateKey(cursor))) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

function averageInRange(source: NumberByDate, start: Date, end: Date): number | '-' {
  let total = 0;
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    const value = Number(source[dateKey(cursor)]);
    if (Number.isFinite(value) && value > 0) {
      total += value;
      count += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  if (count === 0) return '-';
  return Math.round((total / count) * 10) / 10;
}

function toComparableNumber(value: number | '-' | undefined): number {
  return typeof value === 'number' ? value : Number(value);
}

function trendLabel(current: number | '-', previous: number | '-', unit: string, betterWhenLower = false): string {
  const c = toComparableNumber(current);
  const p = toComparableNumber(previous);
  if (!Number.isFinite(c) || !Number.isFinite(p)) return 'No prior data';
  const delta = Math.round((c - p) * 10) / 10;
  if (delta === 0) return 'No change';
  const abs = Math.abs(delta);
  const direction = delta > 0 ? '↑' : '↓';
  const good = (betterWhenLower && delta < 0) || (!betterWhenLower && delta > 0) ? 'improved' : 'worse';
  return `${direction} ${abs}${unit} vs prev (${good})`;
}

export default function PerformanceCalendarPage() {
  const navigate = useNavigate();
  const [monthAnchor, setMonthAnchor] = useState(new Date());
  const [workoutDates, setWorkoutDates] = useState<string[]>([]);
  const [calorieHistory, setCalorieHistory] = useState<NumberByDate>({});
  const [weightHistory, setWeightHistory] = useState<NumberByDate>({});
  const [exercisePlanMap, setExercisePlanMap] = useState<Record<string, string>>({});
  const [challengeState, setChallengeState] = useState<ChallengeState | null>(null);
  const [selectedDate, setSelectedDate] = useState(dateKey(new Date()));
  const [todayWeightInput, setTodayWeightInput] = useState('');

  const loadData = useCallback(() => {
    try {
      const workoutRaw = localStorage.getItem(keys.workoutDates);
      const caloriesRaw = localStorage.getItem(keys.caloriesHistory);
      const weightRaw = localStorage.getItem(keys.weightHistory);
      const exerciseRaw = localStorage.getItem(keys.dailyExercisePlan);
      const challengeRaw = localStorage.getItem(keys.challengeState);

      const workoutParsed = workoutRaw ? (JSON.parse(workoutRaw) as unknown) : [];
      setWorkoutDates(
        Array.isArray(workoutParsed) ? workoutParsed.filter((x): x is string => typeof x === 'string') : []
      );
      setCalorieHistory(parseObject<NumberByDate>(caloriesRaw));
      const weights = parseObject<NumberByDate>(weightRaw);
      setWeightHistory(weights);
      setExercisePlanMap(parseObject<Record<string, string>>(exerciseRaw));
      setChallengeState(challengeRaw ? (JSON.parse(challengeRaw) as ChallengeState) : null);

      const today = dateKey(new Date());
      const existingTodayWeight = weights[today];
      setTodayWeightInput(typeof existingTodayWeight === 'number' ? String(existingTodayWeight) : '');
    } catch {
      setWorkoutDates([]);
      setCalorieHistory({});
      setWeightHistory({});
      setExercisePlanMap({});
      setChallengeState(null);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const workoutSet = useMemo(() => new Set(workoutDates), [workoutDates]);
  const selectedCalories = calorieHistory[selectedDate] ?? 0;
  const selectedWeight = weightHistory[selectedDate] ?? '-';
  const selectedWorkoutDone = workoutSet.has(selectedDate);
  const selectedExerciseId = exercisePlanMap[selectedDate];
  const selectedExercise = workoutPlan.find((item) => item.id === String(selectedExerciseId));
  const activeChallenge = challengeState ? challengePlans.find((x) => x.id === challengeState.planId) : undefined;

  const weeklySummary = useMemo(() => {
    const { start, end } = getWeekRange(new Date());
    return {
      workouts: countWorkoutInRange(workoutSet, start, end),
      avgCalories: averageInRange(calorieHistory, start, end),
      avgWeight: averageInRange(weightHistory, start, end),
    };
  }, [workoutSet, calorieHistory, weightHistory]);

  const previousWeeklySummary = useMemo(() => {
    const { start, end } = getWeekRange(new Date());
    const prevStart = new Date(start);
    prevStart.setDate(start.getDate() - 7);
    const prevEnd = new Date(end);
    prevEnd.setDate(end.getDate() - 7);
    return {
      workouts: countWorkoutInRange(workoutSet, prevStart, prevEnd),
      avgCalories: averageInRange(calorieHistory, prevStart, prevEnd),
      avgWeight: averageInRange(weightHistory, prevStart, prevEnd),
    };
  }, [workoutSet, calorieHistory, weightHistory]);

  const monthlySummary = useMemo(() => {
    const start = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
    const end = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0);
    return {
      workouts: countWorkoutInRange(workoutSet, start, end),
      avgCalories: averageInRange(calorieHistory, start, end),
      avgWeight: averageInRange(weightHistory, start, end),
    };
  }, [monthAnchor, workoutSet, calorieHistory, weightHistory]);

  const previousMonthlySummary = useMemo(() => {
    const prevAnchor = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() - 1, 1);
    const start = new Date(prevAnchor.getFullYear(), prevAnchor.getMonth(), 1);
    const end = new Date(prevAnchor.getFullYear(), prevAnchor.getMonth() + 1, 0);
    return {
      workouts: countWorkoutInRange(workoutSet, start, end),
      avgCalories: averageInRange(calorieHistory, start, end),
      avgWeight: averageInRange(weightHistory, start, end),
    };
  }, [monthAnchor, workoutSet, calorieHistory, weightHistory]);

  const last7Days = useMemo(() => {
    const arr: Array<{ key: string; label: string; calories: number; weight: number }> = [];
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = dateKey(d);
      arr.push({
        key,
        label: key.slice(5),
        calories: Number(calorieHistory[key] || 0),
        weight: Number(weightHistory[key] || 0),
      });
    }
    return arr;
  }, [calorieHistory, weightHistory]);

  const maxCalories = Math.max(1, ...last7Days.map((x) => x.calories));
  const maxWeight = Math.max(1, ...last7Days.map((x) => x.weight));

  const days = useMemo(() => {
    const first = firstDayOfMonth(monthAnchor);
    const jsDay = first.getDay();
    const mondayStartOffset = jsDay === 0 ? 6 : jsDay - 1;
    const daysInMonth = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0).getDate();
    const cells: Array<string | null> = [];

    for (let i = 0; i < mondayStartOffset; i += 1) cells.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) {
      const date = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), d);
      cells.push(dateKey(date));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [monthAnchor]);

  const moveMonth = (delta: number) => {
    const next = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + delta, 1);
    setMonthAnchor(next);
  };

  const saveTodayWeight = async () => {
    const clean = todayWeightInput.replace(/[^0-9.]/g, '');
    const value = parseFloat(clean);
    if (!Number.isFinite(value) || value <= 0) {
      window.alert('Please enter a valid number in kg (example: 72.4).');
      return;
    }
    const today = dateKey(new Date());
    const next: NumberByDate = { ...weightHistory, [today]: Number(value.toFixed(1)) };
    localStorage.setItem(keys.weightHistory, JSON.stringify(next));
    setWeightHistory(next);
    setTodayWeightInput(String(next[today]));
    window.alert(`Today weight saved: ${next[today]} kg`);
  };

  return (
    <div className="app-screen">
      <h1 className="title">Performance calendar</h1>
      <p className="subtitle">
        Workout completion and weight are stored in this browser. Calorie totals normally live on your phone; connect the
        calendar to your API later if you want them here.
      </p>

      <div className="metric-grid" style={{ marginTop: 16 }}>
        <div className="metric-card">
          <div className="metric-label">This week workouts</div>
          <div className="metric-value">{weeklySummary.workouts}</div>
          <div className="metric-note">{trendLabel(weeklySummary.workouts, previousWeeklySummary.workouts, '', false)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg weekly calories</div>
          <div className="metric-value">{weeklySummary.avgCalories === '-' ? '-' : `${weeklySummary.avgCalories}`}</div>
          <div className="metric-note">{trendLabel(weeklySummary.avgCalories, previousWeeklySummary.avgCalories, ' kcal', true)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg weekly weight</div>
          <div className="metric-value">{weeklySummary.avgWeight === '-' ? '-' : `${weeklySummary.avgWeight} kg`}</div>
          <div className="metric-note">{trendLabel(weeklySummary.avgWeight, previousWeeklySummary.avgWeight, ' kg', true)}</div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: 16 }}>
        <div className="glass-card">
          <span className="label">Today weight (kg)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <input
              value={todayWeightInput}
              onChange={(e) => setTodayWeightInput(e.target.value)}
              placeholder="e.g. 72.4"
              style={{
                flex: 1,
                background: 'var(--bg-elevated)',
                borderRadius: 12,
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '12px 14px',
                fontSize: 16,
              }}
            />
            <button
              type="button"
              className="btn-secondary"
              style={{ marginTop: 0, width: 'auto', padding: '12px 16px' }}
              onClick={() => void saveTodayWeight()}
            >
              Save
            </button>
          </div>
        </div>

        {activeChallenge ? (
          <div className="glass-card">
            <span className="label">Challenge progress</span>
            <h2 style={{ margin: '4px 0', fontSize: 16 }}>{activeChallenge.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Day {challengeState?.currentDay ?? 1} / 30</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              Completed days: {challengeState?.completedDays?.length ?? 0}
            </p>
          </div>
        ) : (
          <div className="glass-card">
            <span className="label">Challenge progress</span>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>No active challenge right now.</p>
          </div>
        )}
      </div>

      <div className="glass-card dashboard-span-2" style={{ marginTop: 14 }}>
        <span className="label">Quick summary</span>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>This week</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Workouts: {weeklySummary.workouts}</p>
            <p style={{ fontSize: 11, color: 'var(--accent)' }}>
              {trendLabel(weeklySummary.workouts, previousWeeklySummary.workouts, '', false)}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Avg calories: {weeklySummary.avgCalories} kcal</p>
            <p style={{ fontSize: 11, color: 'var(--accent)' }}>
              {trendLabel(weeklySummary.avgCalories, previousWeeklySummary.avgCalories, ' kcal', true)}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Avg weight: {weeklySummary.avgWeight === '-' ? '-' : `${weeklySummary.avgWeight} kg`}
            </p>
            <p style={{ fontSize: 11, color: 'var(--accent)' }}>
              {trendLabel(weeklySummary.avgWeight, previousWeeklySummary.avgWeight, ' kg', true)}
            </p>
          </div>
          <div style={{ width: 1, background: 'var(--border)', alignSelf: 'stretch' }} />
          <div style={{ flex: 1, minWidth: 140 }}>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>{monthTitle(monthAnchor)}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Workouts: {monthlySummary.workouts}</p>
            <p style={{ fontSize: 11, color: 'var(--accent)' }}>
              {trendLabel(monthlySummary.workouts, previousMonthlySummary.workouts, '', false)}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Avg calories: {monthlySummary.avgCalories} kcal</p>
            <p style={{ fontSize: 11, color: 'var(--accent)' }}>
              {trendLabel(monthlySummary.avgCalories, previousMonthlySummary.avgCalories, ' kcal', true)}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Avg weight: {monthlySummary.avgWeight === '-' ? '-' : `${monthlySummary.avgWeight} kg`}
            </p>
            <p style={{ fontSize: 11, color: 'var(--accent)' }}>
              {trendLabel(monthlySummary.avgWeight, previousMonthlySummary.avgWeight, ' kg', true)}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card dashboard-span-2" style={{ marginTop: 14 }}>
        <span className="label">7-day graph</span>
        <p style={{ fontWeight: 700, marginBottom: 8 }}>Calories intake</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4 }}>
          {last7Days.map((item) => {
            const height = Math.max(4, Math.round((item.calories / maxCalories) * 64));
            return (
              <div key={`k-${item.key}`} style={{ width: '13.5%', textAlign: 'center' }}>
                <div
                  style={{
                    width: 14,
                    margin: '0 auto 4px',
                    height,
                    borderRadius: 6,
                    background: 'var(--accent)',
                    minHeight: 4,
                  }}
                />
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.calories || '-'}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.label}</div>
              </div>
            );
          })}
        </div>
        <p style={{ fontWeight: 700, margin: '12px 0 8px' }}>Weight (kg)</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4 }}>
          {last7Days.map((item) => {
            const height = item.weight ? Math.max(4, Math.round((item.weight / maxWeight) * 64)) : 4;
            return (
              <div key={`w-${item.key}`} style={{ width: '13.5%', textAlign: 'center' }}>
                <div
                  style={{
                    width: 14,
                    margin: '0 auto 4px',
                    height,
                    borderRadius: 6,
                    background: 'var(--success)',
                    minHeight: 4,
                  }}
                />
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.weight || '-'}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card dashboard-span-2" style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <button type="button" className="back-link" style={{ padding: 0 }} onClick={() => moveMonth(-1)}>
            ‹
          </button>
          <span style={{ fontWeight: 700 }}>{monthTitle(monthAnchor)}</span>
          <button type="button" className="back-link" style={{ padding: 0 }} onClick={() => moveMonth(1)}>
            ›
          </button>
        </div>
        <div style={{ display: 'flex', marginBottom: 8 }}>
          {WEEK_LABELS.map((label) => (
            <span key={label} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
              {label}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {days.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} style={{ width: '14.2857%', minHeight: 72 }} />;
            const isSelected = day === selectedDate;
            const done = workoutSet.has(day);
            const kcal = calorieHistory[day];
            const weight = weightHistory[day];
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDate(day)}
                style={{
                  width: '14.2857%',
                  minHeight: 72,
                  border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  background: isSelected ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                  padding: 4,
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--text)',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700 }}>{Number(day.slice(-2))}</div>
                {done ? <div style={{ fontSize: 10, color: 'var(--success)', fontWeight: 700 }}>Done</div> : null}
                {kcal ? <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{kcal}k</div> : null}
                {weight ? <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{weight}kg</div> : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass-card dashboard-span-2" style={{ marginTop: 14 }}>
        <span className="label">Selected day</span>
        <p style={{ fontSize: 18, fontWeight: 700 }}>{selectedDate}</p>
        <p style={{ color: 'var(--text-muted)' }}>Exercise: {selectedWorkoutDone ? 'Done' : 'Not done'}</p>
        <p style={{ color: 'var(--text-muted)' }}>Calories intake: {selectedCalories} kcal</p>
        <p style={{ color: 'var(--text-muted)' }}>Weight: {selectedWeight === '-' ? '-' : `${selectedWeight} kg`}</p>
        <p style={{ color: 'var(--text-muted)' }}>
          Planned exercise: {selectedExercise ? selectedExercise.name : 'Not assigned'}
        </p>
        <button
          type="button"
          className="btn-secondary"
          style={{ marginTop: 12 }}
          onClick={() => navigate(`/tutorials?date=${encodeURIComponent(selectedDate)}`)}
        >
          Change exercise for this day
        </button>
      </div>
    </div>
  );
}
