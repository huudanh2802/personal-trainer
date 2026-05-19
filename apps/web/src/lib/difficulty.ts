import type { Exercise } from '../data/exercises';
import { getJson } from './storage';
import { keys } from './storage';

export const MIN_DIFFICULTY = 0;
export const MAX_DIFFICULTY = 6;
/** Level 3 matches the prescribed sets/reps in exercise data. */
export const BASELINE_DIFFICULTY = 3;

type TodayDifficultyOverride = {
  date: string;
  level: number;
};

type ProgressionState = {
  level: number;
  completedSinceLevelUp: number;
  lastWorkoutDate?: string;
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function clampLevel(level: number): number {
  return Math.max(MIN_DIFFICULTY, Math.min(level, MAX_DIFFICULTY));
}

export function getProgressionLevel(): number {
  const progression = getJson<ProgressionState | null>(keys.progression, null);
  return clampLevel(progression?.level ?? 0);
}

export function getEffectiveDifficulty(progressionLevel = getProgressionLevel()): number {
  const override = getJson<TodayDifficultyOverride | null>(keys.todayDifficulty, null);
  if (override?.date === todayKey()) {
    return clampLevel(override.level);
  }
  return clampLevel(progressionLevel);
}

export function scalePlan(base: Exercise[], level: number): Exercise[] {
  return base.map((item) => scaleExercise(item, level));
}

export function scaleExercise(base: Exercise, level: number): Exercise {
  const cappedLevel = clampLevel(level);
  const delta = cappedLevel - BASELINE_DIFFICULTY;
  const setsBoost = Math.floor(cappedLevel / 2) - Math.floor(BASELINE_DIFFICULTY / 2);
  const sets = Math.max(1, base.sets + setsBoost);

  if (typeof base.reps === 'number') {
    return {
      ...base,
      sets,
      reps: Math.max(1, base.reps + delta * 2),
    };
  }

  const minsMatch = /^(\d+)\s*mins$/i.exec(base.reps);
  if (minsMatch) {
    const mins = parseInt(minsMatch[1], 10);
    return {
      ...base,
      sets,
      reps: `${Math.max(3, mins + delta * 2)} mins`,
    };
  }

  return { ...base, sets, reps: base.reps };
}
