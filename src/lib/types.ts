export interface Habit {
  id: string;
  name: string;
  description: string;
  points: number;
  penalty: number;
}

export interface CompletedHabit {
  habitId: string;
  completedAt: string; // ISO timestamp
}

export interface HabitLog {
  date: string; // YYYY-MM-DD
  completedHabits: CompletedHabit[];
}
