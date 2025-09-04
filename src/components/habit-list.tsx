'use client';

import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import type { Habit } from '@/lib/types';
import { Target } from 'lucide-react';

interface HabitListProps {
  habits: Habit[];
  completedHabitIds: string[];
  onToggleHabit: (habitId: string) => void;
}

export default function HabitList({ habits, completedHabitIds, onToggleHabit }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <div className="text-center py-10">
        <Target className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No Habits Yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Click "Add New Habit" to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {habits.map(habit => {
        const isCompleted = completedHabitIds.includes(habit.id);
        return (
          <div
            key={habit.id}
            className={`flex items-start gap-4 rounded-lg border p-4 transition-all ${isCompleted ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}
          >
            <Checkbox
              id={`habit-${habit.id}`}
              checked={isCompleted}
              onCheckedChange={() => onToggleHabit(habit.id)}
              className="mt-1 h-5 w-5"
              aria-label={`Mark '${habit.name}' as ${isCompleted ? 'incomplete' : 'complete'}`}
            />
            <div className="grid gap-1">
              <label htmlFor={`habit-${habit.id}`} className="font-medium cursor-pointer">
                {habit.name}
              </label>
              <p className="text-sm text-muted-foreground">{habit.description}</p>
            </div>
            <div className={`ml-auto font-bold text-sm ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
              {habit.points} pts
            </div>
          </div>
        );
      })}
    </div>
  );
}
