'use client';

import * as React from 'react';
import { generateDailyProductivityScore } from '@/ai/flows/daily-productivity-score';
import type { Habit } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface ProductivityScoreProps {
  habits: Habit[];
  completedHabitIds: string[];
}

export default function ProductivityScore({ habits, completedHabitIds }: ProductivityScoreProps) {
  const [score, setScore] = React.useState<number | null>(null);
  const [reasoning, setReasoning] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    async function calculateScore() {
      if (completedHabitIds.length === 0) {
        setScore(0);
        setReasoning('Complete some habits to see your score!');
        return;
      }

      setIsLoading(true);
      try {
        const completedHabits = habits
          .filter(h => completedHabitIds.includes(h.id))
          .map(h => h.name);

        const rewardSystem = habits.reduce((acc, habit) => {
          acc[habit.name] = habit.points;
          return acc;
        }, {} as Record<string, number>);
        
        const result = await generateDailyProductivityScore({ completedHabits, rewardSystem });
        setScore(result.score);
        setReasoning(result.reasoning);
      } catch (error) {
        console.error('Failed to generate productivity score:', error);
        setScore(null);
        setReasoning('Could not calculate score due to an error.');
      } finally {
        setIsLoading(false);
      }
    }

    calculateScore();
  }, [completedHabitIds, habits]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-24 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  return (
    <div className="text-center space-y-2">
      <div className="text-6xl font-bold text-primary">
        {score !== null ? score : '-'}
      </div>
      <p className="text-sm text-muted-foreground">{reasoning}</p>
    </div>
  );
}
