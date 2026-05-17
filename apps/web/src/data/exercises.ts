export type WorkoutDayType =
  | 'rest'
  | 'lower_core'
  | 'upper_strength'
  | 'metabolic'
  | 'cardio_intervals'
  | 'steady_state'
  | 'active_recovery';

export type Exercise = {
  id: string;
  name: string;
  youtubeId: string;
  youtubeTitle: string;
  videoCredit: string;
  videoLoop: boolean;
  sets: number;
  reps: number | string;
  repGuide: string;
  description: string;
  category: string;
};

export const workoutPlan: Exercise[] = [
  {
    id: '1',
    name: 'Kettlebell Swings',
    youtubeId: 'WM8g4Mlu5Zs',
    youtubeTitle: 'The BEST Kettlebell Swing Tutorial',
    videoCredit: 'Kettlebell swing how-to · Squat University · youtube.com/shorts/WM8g4Mlu5Zs',
    videoLoop: true,
    sets: 3,
    reps: 15,
    repGuide:
      '1 rep = one full hip swing: hike the bell back with flat back and vertical shins, then snap hips forward; bell floats near chest height at the top; let it swing back through your legs with control. Each out-and-back cycle is one rep.',
    description: 'Hinge at the hips and snap forward using your glutes.',
    category: 'Power',
  },
  {
    id: '2',
    name: 'Dumbbell Goblet Squat',
    youtubeId: 'eLX_dyvooKQ',
    youtubeTitle: 'How to Perform Dumbbell Goblet Squat',
    videoCredit: 'Dumbbell goblet squat · The Strength Center · youtube.com/shorts/eLX_dyvooKQ',
    videoLoop: true,
    sets: 3,
    reps: 12,
    repGuide:
      '1 rep = start standing tall with weight at your chest, squat down to your safe depth (aim for thighs about parallel) while keeping heels down and torso tall, then stand back up until hips and knees are straight again.',
    description: 'Hold one dumbbell at chest height. Keep your heels down.',
    category: 'Legs',
  },
  {
    id: '3',
    name: 'Treadmill Incline Walk',
    youtubeId: 'NAsObfFJXvE',
    youtubeTitle: 'Focus on the 1:1 work-to-rest ratio (1 min fast / 1 min slow)',
    videoCredit: 'Incline walk how-to (12-3-30 style) · Live Lean TV · youtube.com/watch?v=NAsObfFJXvE',
    videoLoop: false,
    sets: 1,
    reps: '20 mins',
    repGuide:
      'This part is time-based, not "reps": one completion = walking the full duration (e.g. 20 minutes) at your target incline and speed without stopping the block early.',
    description: 'Set incline to 5% and walk at 5.0 km/h.',
    category: 'Cardio',
  },
  {
    id: '4',
    name: 'Dumbbell Reverse Lunges',
    youtubeId: 'RZKXLMxPF_I',
    youtubeTitle: 'Dumbbell Reverse Lunges | Proper Form',
    videoCredit: 'Dumbbell reverse lunges · youtube.com/watch?v=RZKXLMxPF_I',
    videoLoop: true,
    sets: 3,
    reps: 10,
    repGuide:
      '1 rep = step one leg back, lower until both knees bend safely, then drive through front heel back to standing.',
    description: 'Keep torso upright and control each step.',
    category: 'Lower Body',
  },
  {
    id: '5',
    name: 'Plank with Shoulder Taps',
    youtubeId: 'gKA5LBy7WAI',
    youtubeTitle: 'How To Properly Do a Plank with Shoulder Taps',
    videoCredit: 'Plank with shoulder taps · youtube.com/watch?v=gKA5LBy7WAI',
    videoLoop: true,
    sets: 3,
    reps: 20,
    repGuide: '1 rep = from stable plank, tap opposite shoulder with one hand while minimizing hip sway.',
    description: 'Brace core and keep hips level.',
    category: 'Core',
  },
  {
    id: '6',
    name: 'Kettlebell Russian Twists',
    youtubeId: 'PkGPokybYaU',
    youtubeTitle: 'How To Do A KETTLEBELL RUSSIAN TWIST',
    videoCredit: 'Kettlebell Russian twist · youtube.com/watch?v=PkGPokybYaU',
    videoLoop: true,
    sets: 3,
    reps: 20,
    repGuide:
      '1 rep = rotate from one side to the other with controlled torso movement while feet or heels are grounded.',
    description: 'Rotate through core, not just arms.',
    category: 'Core',
  },
  {
    id: '7',
    name: 'Dumbbell Overhead Press',
    youtubeId: 'vlFGTI5JzjI',
    youtubeTitle: 'The PERFECT Dumbbell Shoulder Press',
    videoCredit: 'Dumbbell shoulder press · youtube.com/watch?v=vlFGTI5JzjI',
    videoLoop: true,
    sets: 3,
    reps: 10,
    repGuide:
      '1 rep = press dumbbells overhead until arms are extended, then lower under control to shoulder level.',
    description: 'Avoid over-arching your lower back.',
    category: 'Upper Body',
  },
  {
    id: '8',
    name: 'Dumbbell Renegade Rows',
    youtubeId: 'wTqlJ0aoJlM',
    youtubeTitle: 'Renegade Row: Core & Back Builder',
    videoCredit: 'Renegade row · youtube.com/watch?v=wTqlJ0aoJlM',
    videoLoop: true,
    sets: 3,
    reps: 8,
    repGuide: '1 rep = from plank on dumbbells, row one dumbbell to ribcage while keeping hips square.',
    description: 'Move slowly and brace your core.',
    category: 'Upper Body',
  },
  {
    id: '9',
    name: 'Push-ups',
    youtubeId: 'I9fsqKE5XHo',
    youtubeTitle: 'Push-ups for Beginners',
    videoCredit: 'Push-ups for beginners · youtube.com/watch?v=I9fsqKE5XHo',
    videoLoop: true,
    sets: 3,
    reps: 10,
    repGuide: '1 rep = chest moves toward floor with straight line body, then press back to start.',
    description: 'Use incline variation if needed.',
    category: 'Upper Body',
  },
  {
    id: '10',
    name: 'Bicep Curls',
    youtubeId: 'K5hFLVJnnsw',
    youtubeTitle: 'Dumbbell Bicep Curls Demonstration and Lateral Raise Tip',
    videoCredit: 'Bicep curls · youtube.com/watch?v=K5hFLVJnnsw',
    videoLoop: true,
    sets: 3,
    reps: 12,
    repGuide: '1 rep = curl dumbbells up while elbows stay near torso, then lower slowly.',
    description: 'Control both up and down phases.',
    category: 'Upper Body',
  },
  {
    id: '11',
    name: 'Lateral Raises',
    youtubeId: 'K5hFLVJnnsw',
    youtubeTitle: 'Dumbbell Bicep Curls Demonstration and Lateral Raise Tip',
    videoCredit: 'Lateral raise segment · youtube.com/watch?v=K5hFLVJnnsw',
    videoLoop: true,
    sets: 3,
    reps: 12,
    repGuide:
      '1 rep = raise dumbbells out to shoulder height with slight elbow bend, then lower with control.',
    description: 'Keep shoulders down and neck relaxed.',
    category: 'Upper Body',
  },
  {
    id: '12',
    name: 'Dumbbell Floor Press',
    youtubeId: 'lNdi7VEf2Ew',
    youtubeTitle: 'Dumbbell Floor Press - Exercise Tutorial',
    videoCredit: 'Dumbbell floor press · youtube.com/watch?v=lNdi7VEf2Ew',
    videoLoop: true,
    sets: 3,
    reps: 12,
    repGuide:
      '1 rep = press dumbbells from floor position to full elbow extension and lower to triceps touch.',
    description: 'Great chest/triceps press with shoulder-friendly range.',
    category: 'Upper Body',
  },
  {
    id: '13',
    name: 'Dumbbell Thrusters',
    youtubeId: 'cPzfRo_jti0',
    youtubeTitle: 'How To Properly Do A Dumbbell Thruster',
    videoCredit: 'Dumbbell thruster · youtube.com/watch?v=cPzfRo_jti0',
    videoLoop: true,
    sets: 4,
    reps: 10,
    repGuide:
      '1 rep = full squat into standing drive that continues into an overhead press in one fluid motion.',
    description: 'Keep core tight and move explosively but controlled.',
    category: 'Metabolic',
  },
  {
    id: '14',
    name: 'Mountain Climbers',
    youtubeId: 'cnyTQDSE884',
    youtubeTitle: 'How to Do Mountain Climbers | The Right Way',
    videoCredit: 'Mountain climbers · youtube.com/watch?v=cnyTQDSE884',
    videoLoop: true,
    sets: 4,
    reps: 30,
    repGuide: '1 rep = drive one knee toward chest from plank. Alternate sides.',
    description: 'Maintain a strong plank line.',
    category: 'Metabolic',
  },
  {
    id: '15',
    name: 'Dumbbell Sumo Deadlifts',
    youtubeId: 'De9OUZz5W_I',
    youtubeTitle: 'Dumbbell Sumo Deadlift (Full Tutorial)',
    videoCredit: 'Dumbbell sumo deadlift · youtube.com/watch?v=De9OUZz5W_I',
    videoLoop: true,
    sets: 4,
    reps: 12,
    repGuide:
      '1 rep = hinge at hips with wide stance, lower dumbbell(s) under control, then stand by driving through heels.',
    description: 'Keep chest tall and back neutral.',
    category: 'Metabolic',
  },
  {
    id: '17',
    name: 'Steady State Cardio',
    youtubeId: 'Ib5ga-vL5VY',
    youtubeTitle: 'Keep a consistent "zone 2" pace where you are slightly breathless',
    videoCredit: 'Zone 2 cardio guidance · youtube.com/watch?v=Ib5ga-vL5VY',
    videoLoop: false,
    sets: 1,
    reps: '30 mins',
    repGuide: 'Complete the full time block at an easy-moderate sustainable pace.',
    description: 'Nasal breathing possible but slightly challenged.',
    category: 'Cardio',
  },
  {
    id: '18',
    name: 'Active Recovery Stretch',
    youtubeId: 'qjKdwhEWoyM',
    youtubeTitle: 'Full Body Stretching Routine on the Mat',
    videoCredit: 'Full-body stretch routine · youtube.com/watch?v=qjKdwhEWoyM',
    videoLoop: false,
    sets: 1,
    reps: '20 mins',
    repGuide: 'Move through full-body stretches without forcing range of motion.',
    description: 'Prioritize breathing and mobility quality.',
    category: 'Recovery',
  },
  {
    id: '19',
    name: 'Pull-up Bar Assisted Pull-ups',
    youtubeId: 'gx0RWT7WbmA',
    youtubeTitle: 'Assisted Pull-Up Form for Beginners',
    videoCredit: 'Assisted pull-up form · youtube.com/watch?v=gx0RWT7WbmA',
    videoLoop: true,
    sets: 4,
    reps: 6,
    repGuide:
      '1 rep = start from a dead hang with shoulders active, pull until chin clears the bar, then lower with control. Use a chair or band for assistance if needed.',
    description: 'Build upper-back and arm strength with controlled full range.',
    category: 'Upper Body',
  },
  {
    id: '21',
    name: 'Negative Pull-ups',
    youtubeId: 'gbPURTSxQLY',
    youtubeTitle: 'How To Do a Negative Pull-Up | Exercise Guide',
    videoCredit: 'Negative pull-up how-to · Bodybuilding.com · youtube.com/watch?v=gbPURTSxQLY',
    videoLoop: true,
    sets: 3,
    reps: 5,
    repGuide:
      '1 rep = jump or step to chin-over-bar, then lower slowly for 3–5 seconds with tight core and lats engaged until arms are fully extended; release and reset.',
    description: 'Eccentric pull-up lowers build lat and grip strength toward full pull-ups.',
    category: 'Upper Body',
  },
  {
    id: '22',
    name: 'Dynamic Warm-Up',
    youtubeId: 'divaflydT7M',
    youtubeTitle: '5 Minute Dynamic Warm Up',
    videoCredit: 'Dynamic warm-up · TIFF x DAN · youtube.com/watch?v=divaflydT7M',
    videoLoop: false,
    sets: 1,
    reps: '5 mins',
    repGuide:
      'Follow the full 5-minute routine: leg swings, bear crawls, toe-touch squats, butt kicks, and shoulder mobility—move continuously with control.',
    description: 'Low-impact full-body warm-up before every session to raise heart rate and prep joints.',
    category: 'Warm-up',
  },
  {
    id: '20',
    name: 'Treadmill Intervals',
    youtubeId: 'P8fmIvqQEf4',
    youtubeTitle: 'Beginner Treadmill Interval Technique and Pacing',
    videoCredit: 'Treadmill intervals · youtube.com/watch?v=P8fmIvqQEf4',
    videoLoop: false,
    sets: 8,
    reps: '1 min',
    repGuide:
      '1 rep = one full minute at a faster treadmill pace. Rest 30-45 seconds between rounds at a light walk before the next interval.',
    description: 'Interval treadmill work to improve conditioning and cardiovascular capacity.',
    category: 'Cardio',
  },
];

export const exerciseById: Record<string, Exercise> = Object.fromEntries(workoutPlan.map((item) => [item.id, item]));

/** Prepended to every scheduled workout day (and challenges). */
export const DAILY_WARMUP_EXERCISE_ID = '22';

export function withDailyWarmUp(exerciseIds: string[]): string[] {
  if (exerciseIds.includes(DAILY_WARMUP_EXERCISE_ID)) return exerciseIds;
  return [DAILY_WARMUP_EXERCISE_ID, ...exerciseIds];
}

export const weeklySchedule: Record<number, { type: WorkoutDayType; exerciseIds: string[]; title: string }> = {
  0: { type: 'active_recovery', exerciseIds: ['18'], title: 'Sunday: Active Recovery' },
  1: { type: 'lower_core', exerciseIds: ['1', '2', '4', '5', '6'], title: 'Monday: Lower Body & Core' },
  2: { type: 'cardio_intervals', exerciseIds: ['20', '3'], title: 'Tuesday: Treadmill Intervals + Incline Walk' },
  3: {
    type: 'upper_strength',
    exerciseIds: ['21', '19', '7', '8', '9', '10', '11', '12'],
    title: 'Wednesday: Pull-up + Upper Body Strength',
  },
  4: { type: 'active_recovery', exerciseIds: ['18'], title: 'Thursday: Active Recovery' },
  5: { type: 'metabolic', exerciseIds: ['13', '14', '15', '20'], title: 'Friday: Metabolic + Treadmill Finisher' },
  6: { type: 'steady_state', exerciseIds: ['17'], title: 'Saturday: Steady State Cardio' },
};
