import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Exercise, WorkoutDayType } from '../data/exercises';
import {
  workoutPlan as fallbackPlan,
  exerciseById as fallbackById,
  weeklySchedule as fallbackSchedule,
  DAILY_WARMUP_EXERCISE_ID as fallbackWarmUpId,
  withDailyWarmUp as fallbackWithWarmUp,
} from '../data/exercises';
import { api, apiConfigured, type ExerciseDto, type WeeklyScheduleDto } from '../lib/api';

type WeeklySchedule = Record<
  number,
  { type: WorkoutDayType; exerciseIds: string[]; title: string }
>;

type WorkoutDataContextValue = {
  loading: boolean;
  fromApi: boolean;
  exercises: Exercise[];
  exerciseById: Record<string, Exercise>;
  weeklySchedule: WeeklySchedule;
  dailyWarmUpExerciseId: string;
  withDailyWarmUp: (exerciseIds: string[]) => string[];
  reload: () => Promise<void>;
};

const WorkoutDataContext = createContext<WorkoutDataContextValue | null>(null);

function mapExercise(dto: ExerciseDto): Exercise {
  const repsNum = Number(dto.reps);
  const reps: number | string = Number.isFinite(repsNum) && dto.reps.trim() === String(repsNum) ? repsNum : dto.reps;
  return {
    id: dto.id,
    name: dto.name,
    youtubeId: dto.youtubeId,
    youtubeTitle: dto.youtubeTitle,
    videoCredit: dto.videoCredit,
    videoLoop: dto.videoLoop,
    sets: dto.sets,
    reps,
    repGuide: dto.repGuide,
    description: dto.description,
    category: dto.category,
  };
}

function mapSchedule(dto: WeeklyScheduleDto): WeeklySchedule {
  const out: WeeklySchedule = {};
  for (const day of dto.days) {
    out[day.dayOfWeek] = {
      type: day.dayType as WorkoutDayType,
      exerciseIds: [...day.exerciseIds],
      title: day.title,
    };
  }
  return out;
}

export function WorkoutDataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(apiConfigured());
  const [fromApi, setFromApi] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>(fallbackPlan);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>(fallbackSchedule);
  const [dailyWarmUpExerciseId, setDailyWarmUpExerciseId] = useState(fallbackWarmUpId);

  const load = useCallback(async () => {
    if (!apiConfigured()) {
      setLoading(false);
      setFromApi(false);
      return;
    }
    setLoading(true);
    try {
      const [exerciseDtos, scheduleDto] = await Promise.all([api.exercises(), api.weeklySchedule()]);
      const mapped = exerciseDtos.map(mapExercise);
      setExercises(mapped);
      setWeeklySchedule(mapSchedule(scheduleDto));
      setDailyWarmUpExerciseId(scheduleDto.dailyWarmUpExerciseId);
      setFromApi(true);
    } catch {
      setExercises(fallbackPlan);
      setWeeklySchedule(fallbackSchedule);
      setDailyWarmUpExerciseId(fallbackWarmUpId);
      setFromApi(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const exerciseById = useMemo(
    () => Object.fromEntries(exercises.map((item) => [item.id, item])),
    [exercises]
  );

  const withDailyWarmUp = useCallback(
    (exerciseIds: string[]) => {
      if (exerciseIds.includes(dailyWarmUpExerciseId)) return exerciseIds;
      return [dailyWarmUpExerciseId, ...exerciseIds];
    },
    [dailyWarmUpExerciseId]
  );

  const value = useMemo(
    () => ({
      loading,
      fromApi,
      exercises,
      exerciseById,
      weeklySchedule,
      dailyWarmUpExerciseId,
      withDailyWarmUp,
      reload: load,
    }),
    [loading, fromApi, exercises, exerciseById, weeklySchedule, dailyWarmUpExerciseId, withDailyWarmUp, load]
  );

  return <WorkoutDataContext.Provider value={value}>{children}</WorkoutDataContext.Provider>;
}

export function useWorkoutData(): WorkoutDataContextValue {
  const ctx = useContext(WorkoutDataContext);
  if (!ctx) {
    return {
      loading: false,
      fromApi: false,
      exercises: fallbackPlan,
      exerciseById: fallbackById,
      weeklySchedule: fallbackSchedule,
      dailyWarmUpExerciseId: fallbackWarmUpId,
      withDailyWarmUp: fallbackWithWarmUp,
      reload: async () => undefined,
    };
  }
  return ctx;
}
