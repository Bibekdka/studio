export interface Habit {
  id: string;
  name: string;
  description: string;
  points: number;
}

export interface HabitLog {
  date: string; // YYYY-MM-DD
  completedHabits: string[]; // array of habit IDs
}
