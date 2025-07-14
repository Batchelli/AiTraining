export interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  currentTargetWeight: string;
  history: Array<{ date: string; weight: string }>;
}

export interface WorkoutGroup {
  id: string;
  name:string;
  exercises: Exercise[];
}