import { getToken } from './auth';

const baseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function apiConfigured(): boolean {
  return Boolean(baseUrl);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!baseUrl) throw new ApiError(0, 'API URL not configured (set VITE_API_URL).');

  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');

  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export type ExerciseDto = {
  id: string;
  name: string;
  youtubeId: string;
  youtubeTitle: string;
  videoCredit: string;
  videoLoop: boolean;
  sets: number;
  reps: string;
  repGuide: string;
  description: string;
  category: string;
};

export type ScheduleDayDto = {
  dayOfWeek: number;
  dayType: string;
  title: string;
  exerciseIds: string[];
};

export type WeeklyScheduleDto = {
  dailyWarmUpExerciseId: string;
  days: ScheduleDayDto[];
};

export type AuthResponse = {
  token: string;
  email: string;
  roles: string[];
  expiresAt: string;
};

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ email: string; roles: string[] }>('/api/auth/me'),
  exercises: () => request<ExerciseDto[]>('/api/exercises'),
  weeklySchedule: () => request<WeeklyScheduleDto>('/api/schedule/weekly'),
  adminExercises: () => request<ExerciseDto[]>('/api/admin/exercises'),
  createExercise: (body: Record<string, unknown>) =>
    request<ExerciseDto>('/api/admin/exercises', { method: 'POST', body: JSON.stringify(body) }),
  updateExercise: (id: string, body: Record<string, unknown>) =>
    request<ExerciseDto>(`/api/admin/exercises/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteExercise: (id: string) => request<void>(`/api/admin/exercises/${id}`, { method: 'DELETE' }),
  updateScheduleDay: (dayOfWeek: number, body: Record<string, unknown>) =>
    request<ScheduleDayDto>(`/api/admin/schedule/${dayOfWeek}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
};
