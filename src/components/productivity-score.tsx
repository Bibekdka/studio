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
      setIsLoading(true);
      try {
        const completedHabitNames = habits
          .filter(h => completedHabitIds.includes(h.id))
          .map(h => h.name);
        
        const allHabits = habits.map(h => ({ name: h.name, points: h.points, penalty: h.penalty }));

        const result = await generateDailyProductivityScore({ allHabits, completedHabitNames });
        setScore(result.score);
        setReasoning(result.reasoning);
      } catch (error) {
        console.error('Failed to generate productivity score:', error);
        
        // Fallback to manual calculation on error
        const completedScore = habits
            .filter(h => completedHabitIds.includes(h.id))
            .reduce((sum, h) => sum + h.points, 0);
        const missedPenalty = habits
            .filter(h => h.penalty > 0 && !completedHabitIds.includes(h.id))
            .reduce((sum, h) => sum + h.penalty, 0);
        const finalScore = completedScore - missedPenalty;
        setScore(finalScore);
        setReasoning('Score calculated locally.');

      } finally {
        setIsLoading(false);
      }
    }

    // Only calculate if there are habits defined
    if (habits.length > 0) {
      calculateScore();
    } else {
      setScore(0);
      setReasoning('Add some habits to get started!');
    }
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
      <div className={`text-6xl font-bold ${score !== null && score > 0 ? 'text-primary' : score !== null && score < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
        {score !== null ? score : '-'}
      </div>
      <p className="text-sm text-muted-foreground px-4">{reasoning}</p>
    </div>
  );
}
