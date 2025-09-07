export interface Habit {
  id: string;
  name: string;
  description: string;
  points: number;
  penalty: number;
}

export interface CompletedHabit {
  habitId: string;
}

export interface HabitLog {
  date: string; // YYYY-MM-DD
  completedHabits: CompletedHabit[];
}
