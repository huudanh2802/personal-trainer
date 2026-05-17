import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Exercise } from '../data/exercises';
import {
  workoutPlan,
  exerciseById,
  weeklySchedule,
  withDailyWarmUp,
  DAILY_WARMUP_EXERCISE_ID,
} from '../data/exercises';
import { keys, getJson, setJson } from '../lib/storage';
import { challengePlans, getChallengeDayType, type ChallengeState } from '../data/challenges';

const REST_SEC = 60;
const INACTIVITY_RESET_DAYS = 8;

type ProgressionState = {
  level: number;
  completedSinceLevelUp: number;
  lastWorkoutDate?: string;
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(from: Date, to: Date): number {
  const a = new Date(from);
  const b = new Date(to);
  a.setHours(12, 0, 0, 0);
  b.setHours(12, 0, 0, 0);
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function scaleExercise(base: Exercise, level: number): Exercise {
  const cappedLevel = Math.max(0, Math.min(level, 6));
  const setsBoost = Math.floor(cappedLevel / 2);
  let repsScaled: number | string = base.reps;

  if (typeof base.reps === 'number') {
    repsScaled = base.reps + cappedLevel * 2;
  } else {
    const minsMatch = /^(\d+)\s*mins$/i.exec(base.reps);
    if (minsMatch) {
      const mins = parseInt(minsMatch[1], 10);
      repsScaled = `${mins + cappedLevel * 2} mins`;
    }
  }

  return {
    ...base,
    sets: base.sets + setsBoost,
    reps: repsScaled,
  };
}

async function recordWorkoutDay(): Promise<void> {
  try {
    const raw = getJson<string[] | null>(keys.workoutDates, null);
    const k = todayKey();
    let list = Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : [];
    if (!list.includes(k)) {
      list.push(k);
      setJson(keys.workoutDates, list);
    }
  } catch {
    /* ignore */
  }
}

export default function WorkoutPage() {
  const navigate = useNavigate();
  const [activePlan, setActivePlan] = useState<Exercise[]>(workoutPlan);
  const [scheduleTitle, setScheduleTitle] = useState("Today's Workout");
  const [challengeDayLabel, setChallengeDayLabel] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [setCount, setSetCount] = useState(1);
  const [restOpen, setRestOpen] = useState(false);
  const [restLeft, setRestLeft] = useState(REST_SEC);
  const [videoError, setVideoError] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [progressionLevel, setProgressionLevel] = useState(0);
  const [swapOpen, setSwapOpen] = useState(false);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const current = activePlan[index] || workoutPlan[0];

  useEffect(() => {
    setVideoError(false);
    setVideoReady(false);
  }, [current.id]);

  useEffect(
    () => () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    },
    []
  );

  const loadTodayPlanAndProgression = useCallback(() => {
    try {
      const today = new Date();
      const todayIso = todayKey();
      const dayInfo = weeklySchedule[today.getDay()];
      const assignmentRaw = localStorage.getItem(keys.dailyExercisePlan);
      const progressionRaw = localStorage.getItem(keys.progression);
      const challengeRaw = localStorage.getItem(keys.challengeState);

      let progression: ProgressionState = { level: 0, completedSinceLevelUp: 0 };
      if (progressionRaw) {
        const parsed = JSON.parse(progressionRaw) as ProgressionState;
        if (parsed && typeof parsed === 'object') progression = parsed;
      }

      if (progression.lastWorkoutDate) {
        const gap = daysBetween(new Date(progression.lastWorkoutDate), today);
        if (gap >= INACTIVITY_RESET_DAYS && progression.level > 0) {
          progression = {
            level: 0,
            completedSinceLevelUp: 0,
            lastWorkoutDate: progression.lastWorkoutDate,
          };
          localStorage.setItem(keys.progression, JSON.stringify(progression));
          window.alert(`No workout for ${gap} days, so difficulty was reset to base level.`);
        }
      }
      setProgressionLevel(progression.level);
      setChallengeDayLabel(null);

      if (challengeRaw) {
        const challengeState = JSON.parse(challengeRaw) as ChallengeState;
        const plan = challengePlans.find((x) => x.id === challengeState.planId);
        if (plan) {
          const challengeDay = Math.min(Math.max(challengeState.currentDay || 1, 1), 30);
          const dayType = getChallengeDayType(plan, challengeDay);
          const weekMatch = Object.values(weeklySchedule).find((item) => item.type === dayType);
          if (weekMatch) {
            const challengeExercises = withDailyWarmUp(weekMatch.exerciseIds)
              .map((id) => exerciseById[id])
              .filter((x): x is Exercise => Boolean(x))
              .map((x) => scaleExercise(x, progression.level));
            if (challengeExercises.length > 0) {
              setChallengeDayLabel(`${plan.title} · Day ${challengeDay}/30`);
              setScheduleTitle(weekMatch.title);
              setActivePlan(challengeExercises);
              setIndex(0);
              setSetCount(1);
              return;
            }
          }
        }
      }

      if (assignmentRaw) {
        const parsed = JSON.parse(assignmentRaw) as Record<string, string> | null;
        const todayAssignedId = parsed?.[todayIso];
        const assigned = todayAssignedId ? exerciseById[String(todayAssignedId)] : undefined;
        if (assigned) {
          const warmUp = exerciseById[DAILY_WARMUP_EXERCISE_ID];
          const customPlan: Exercise[] = [];
          if (warmUp && assigned.id !== DAILY_WARMUP_EXERCISE_ID) {
            customPlan.push(scaleExercise(warmUp, progression.level));
          }
          customPlan.push(scaleExercise(assigned, progression.level));
          setScheduleTitle('Today: Custom Assigned Exercise');
          setActivePlan(customPlan);
          setIndex(0);
          setSetCount(1);
          return;
        }
      }

      const scheduledExercises = withDailyWarmUp(dayInfo.exerciseIds)
        .map((id) => exerciseById[id])
        .filter((x): x is Exercise => Boolean(x))
        .map((x) => scaleExercise(x, progression.level));

      if (scheduledExercises.length > 0) {
        setScheduleTitle(dayInfo.title);
        setActivePlan(scheduledExercises);
        setIndex(0);
        setSetCount(1);
        return;
      }

      setScheduleTitle("Today's Workout");
      setActivePlan(workoutPlan.map((x) => scaleExercise(x, progression.level)));
      setIndex(0);
      setSetCount(1);
    } catch {
      setScheduleTitle("Today's Workout");
      setActivePlan(workoutPlan);
      setIndex(0);
      setSetCount(1);
    }
  }, []);

  useEffect(() => {
    loadTodayPlanAndProgression();
  }, [loadTodayPlanAndProgression]);

  const persistProgressionAfterCompletion = async () => {
    try {
      const raw = localStorage.getItem(keys.progression);
      let progression: ProgressionState = { level: 0, completedSinceLevelUp: 0 };
      if (raw) {
        const parsed = JSON.parse(raw) as ProgressionState;
        if (parsed && typeof parsed === 'object') progression = parsed;
      }
      progression.completedSinceLevelUp += 1;
      progression.lastWorkoutDate = todayKey();
      if (progression.completedSinceLevelUp >= 3) {
        progression.level = Math.min(progression.level + 1, 6);
        progression.completedSinceLevelUp = 0;
      }
      localStorage.setItem(keys.progression, JSON.stringify(progression));
      setProgressionLevel(progression.level);
    } catch {
      /* ignore */
    }
  };

  const persistChallengeDayAfterCompletion = async () => {
    try {
      const raw = localStorage.getItem(keys.challengeState);
      if (!raw) return;
      const state = JSON.parse(raw) as ChallengeState;
      const nextDay = Math.min((state.currentDay || 1) + 1, 30);
      const today = todayKey();
      const completed = Array.isArray(state.completedDays) ? state.completedDays : [];
      const next: ChallengeState = {
        ...state,
        currentDay: nextDay,
        completedDays: completed.includes(today) ? completed : [...completed, today],
      };
      localStorage.setItem(keys.challengeState, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const swapExercise = (replacementId: string) => {
    const replacement = exerciseById[replacementId];
    if (!replacement) return;
    const next = [...activePlan];
    next[index] = scaleExercise(replacement, progressionLevel);
    setActivePlan(next);
    setVideoReady(false);
    setVideoError(false);
    setSwapOpen(false);
  };

  const clearRestTimer = () => {
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }
  };

  const startRestCountdown = () => {
    clearRestTimer();
    setRestLeft(REST_SEC);
    setRestOpen(true);
    restTimerRef.current = setInterval(() => {
      setRestLeft((s) => {
        if (s <= 1) {
          clearRestTimer();
          setRestOpen(false);
          return REST_SEC;
        }
        return s - 1;
      });
    }, 1000);
  };

  const skipRest = () => {
    clearRestTimer();
    setRestOpen(false);
    setRestLeft(REST_SEC);
  };

  const handleNextSet = () => {
    if (setCount < current.sets) {
      setSetCount(setCount + 1);
      startRestCountdown();
    } else if (index < activePlan.length - 1) {
      setIndex(index + 1);
      setSetCount(1);
    } else {
      void recordWorkoutDay();
      void persistProgressionAfterCompletion();
      void persistChallengeDayAfterCompletion();
      window.alert('Workout complete! Keep consistency for the next level.');
      navigate('/');
    }
  };

  const repsLabel = typeof current.reps === 'number' ? `${current.reps} reps` : current.reps;

  return (
    <div className="app-screen">
      <button type="button" className="back-link" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div style={{ marginBottom: 6 }}>
        <span
          style={{
            color: 'var(--accent)',
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            background: 'var(--accent-soft)',
            padding: '4px 10px',
            borderRadius: 8,
          }}
        >
          {current.category}
        </span>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', margin: '0 0 6px' }}>
        {scheduleTitle}
      </p>
      {challengeDayLabel ? (
        <p style={{ color: 'var(--success)', fontSize: 12, fontWeight: 700, margin: '0 0 8px' }}>{challengeDayLabel}</p>
      ) : null}
      <h1 className="title" style={{ fontSize: 24 }}>
        {current.name}
      </h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
        {current.sets} sets · {repsLabel}
      </p>
      <p style={{ color: 'var(--accent)', fontSize: 12 }}>Difficulty level: {progressionLevel}</p>
      {activePlan.length === 1 ? (
        <p style={{ color: 'var(--accent)', fontSize: 12 }}>Using your custom exercise assignment for today.</p>
      ) : null}

      <div className="glass-card" style={{ marginTop: 14 }}>
        <span className="label">What counts as one rep</span>
        <p style={{ margin: 0, lineHeight: 1.45 }}>{current.repGuide}</p>
      </div>

      <button type="button" className="btn-secondary" style={{ marginTop: 12 }} onClick={() => setSwapOpen(true)}>
        Swap exercise
      </button>

      <div style={{ marginTop: 12, borderRadius: 20, overflow: 'hidden', background: '#000' }}>
        {!current.video ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>Tutorial title: {current.youtubeTitle}</p>
            <p>No local video for this move.</p>
          </div>
        ) : !videoReady ? (
          <button
            type="button"
            onClick={() => setVideoReady(true)}
            style={{
              width: '100%',
              minHeight: 280,
              background: '#111',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 24,
            }}
          >
            Tap to load exercise video (avoids loading many clips at once).
          </button>
        ) : videoError ? (
          <div style={{ padding: 24, color: 'var(--text-muted)' }}>
            Could not play this clip. Ensure the file exists under public/videos (run npm run sync-web-videos from repo
            root).
          </div>
        ) : (
          <video
            key={current.id}
            ref={videoRef}
            className="tutorial"
            controls
            playsInline
            loop={current.videoLoop !== false}
            muted={!current.videoHasSpeech}
            onError={() => setVideoError(true)}
          >
            <source src={current.video} type="video/mp4" />
          </video>
        )}
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>{current.videoCredit}</p>
      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>YouTube tutorial: {current.youtubeTitle}</p>

      <div className="glass-card" style={{ marginTop: 12 }}>
        <p style={{ margin: 0, lineHeight: 1.45 }}>{current.description}</p>
      </div>

      <p style={{ textAlign: 'center', fontSize: 36, fontWeight: 800, color: 'var(--accent)', margin: '18px 0' }}>
        Set {setCount}/{current.sets}
      </p>

      <button type="button" className="btn-primary" onClick={handleNextSet}>
        Complete set
      </button>

      {restOpen ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            zIndex: 50,
          }}
        >
          <div className="glass-card" style={{ maxWidth: 320, width: '100%', textAlign: 'center' }}>
            <span className="label">Rest</span>
            <div style={{ fontSize: 56, fontWeight: 800 }}>{restLeft}s</div>
            <p style={{ color: 'var(--text-muted)' }}>Next set when you&apos;re ready.</p>
            <button type="button" className="btn-secondary" style={{ marginTop: 16 }} onClick={skipRest}>
              Skip rest
            </button>
          </div>
        </div>
      ) : null}

      {swapOpen ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            zIndex: 50,
          }}
        >
          <div className="glass-card" style={{ maxWidth: 360, width: '100%' }}>
            <span className="label">Swap current exercise</span>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Pick another move from the same category.</p>
            {workoutPlan
              .filter((item) => item.id !== current.id && item.category === current.category)
              .slice(0, 4)
              .map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="btn-secondary"
                  style={{ marginTop: 8 }}
                  onClick={() => swapExercise(item.id)}
                >
                  {item.name}
                </button>
              ))}
            <button type="button" className="btn-secondary" style={{ marginTop: 12 }} onClick={() => setSwapOpen(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
