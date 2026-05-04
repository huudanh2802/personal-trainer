import type { WorkoutDayType } from './exercises';

export type { WorkoutDayType } from './exercises';

export type ChallengePlan = {
  id: string;
  title: string;
  description: string;
  premium: boolean;
  target: string;
  weeklyTemplate: WorkoutDayType[];
};

export type ChallengeState = {
  planId: string;
  startedOn: string;
  currentDay: number;
  completedDays: string[];
};

const defaultWeek: WorkoutDayType[] = [
  'active_recovery',
  'lower_core',
  'cardio_intervals',
  'upper_strength',
  'active_recovery',
  'metabolic',
  'steady_state',
];

export const challengePlans: ChallengePlan[] = [
  {
    id: 'foundation_30',
    title: '30-Day Foundation',
    description: 'Balanced fat-loss and strength starter with active recovery.',
    premium: false,
    target: 'Build consistency',
    weeklyTemplate: defaultWeek,
  },
  {
    id: 'strength_30',
    title: '30-Day Strength Focus',
    description: 'Upper/lower emphasis with progressive overload on resistance days.',
    premium: true,
    target: 'Increase strength',
    weeklyTemplate: [
      'active_recovery',
      'lower_core',
      'cardio_intervals',
      'upper_strength',
      'upper_strength',
      'metabolic',
      'steady_state',
    ],
  },
  {
    id: 'fatburn_30',
    title: '30-Day Fat Burn',
    description: 'Higher metabolic and cardio frequency while preserving strength.',
    premium: true,
    target: 'Lose body fat',
    weeklyTemplate: [
      'active_recovery',
      'metabolic',
      'cardio_intervals',
      'upper_strength',
      'active_recovery',
      'metabolic',
      'steady_state',
    ],
  },
  {
    id: 'dumbbell_treadmill_fatburn_30',
    title: '30-Day Home Equipment Fat Burn',
    description: 'Alternates dumbbell strength with pull-up bar and jump-rope intervals for higher calorie burn.',
    premium: true,
    target: 'Burn fat with dumbbells + pull-up bar + rope',
    weeklyTemplate: [
      'active_recovery',
      'metabolic',
      'cardio_intervals',
      'upper_strength',
      'cardio_intervals',
      'lower_core',
      'steady_state',
    ],
  },
];

export function getChallengeDayType(plan: ChallengePlan, dayNumber: number): WorkoutDayType {
  const idx = (Math.max(dayNumber, 1) - 1) % 7;
  return plan.weeklyTemplate[idx];
}
