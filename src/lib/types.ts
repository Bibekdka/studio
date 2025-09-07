
export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  points: number;
  penalty: number;
}

export interface CompletedHabit {
  habitId: string;
  completedAt: number; // Store as milliseconds
}

export interface HabitLog {
  date: string; // YYYY-MM-DD
  completedHabits: CompletedHabit[];
}
