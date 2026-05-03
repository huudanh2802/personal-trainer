const prefix = 'pt_web_';

export const keys = {
  workoutDates: `${prefix}workout_dates`,
  dailyExercisePlan: `${prefix}daily_exercise_plan`,
  progression: `${prefix}progression`,
  challengeState: `${prefix}challenge_state`,
  caloriesHistory: `${prefix}diet_calories_history`,
  weightHistory: `${prefix}weight_history`,
};

export function getJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}
