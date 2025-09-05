'use client';

import * as React from 'react';
import { useSwipeable } from 'react-swipeable';
import { Checkbox } from '@/components/ui/checkbox';
import type { Habit } from '@/lib/types';
import { Target, TrendingDown, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Confetti from './confetti';

interface HabitListProps {
  habits: Habit[];
  completedHabitIds: string[];
  onToggleHabit: (habitId: string) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habit: Habit) => void;
}

const SWIPE_THRESHOLD = 50; // pixels

function HabitItem({ habit, isCompleted, onToggleHabit, onDelete }: {
  habit: Habit,
  isCompleted: boolean,
  onToggleHabit: (id: string) => void,
  onEdit: () => void,
  onDelete: () => void,
}) {
  const [swipeOffset, setSwipeOffset] = React.useState(0);
  const [isSwiping, setIsSwiping] = React.useState(false);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const prevIsCompleted = React.useRef(isCompleted);

  React.useEffect(() => {
    if (isCompleted && !prevIsCompleted.current) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
    prevIsCompleted.current = isCompleted;
  }, [isCompleted]);

  const handlers = useSwipeable({
    onSwiping: (event) => {
      setIsSwiping(true);
      setSwipeOffset(event.deltaX);
    },
    onSwiped: (event) => {
      setIsSwiping(false);
      if (Math.abs(event.deltaX) > SWIPE_THRESHOLD) {
        if (event.deltaX < -SWIPE_THRESHOLD) { // Swiped left
          onToggleHabit(habit.id);
        } else if (event.deltaX > SWIPE_THRESHOLD) { // Swiped right
          onDelete();
        }
      }
      
      // Reset position after swipe action
      setTimeout(() => setSwipeOffset(0), 200);
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <div {...handlers} className="relative touch-pan-y overflow-hidden rounded-lg">
       {showConfetti && <Confetti />}
      {/* Background Actions */}
      <div className="absolute inset-0 flex items-center justify-between bg-secondary">
        <div className="flex h-full items-center justify-start bg-destructive px-6 text-destructive-foreground" style={{ width: Math.max(0, swipeOffset) }}>
          <Trash2 className="h-5 w-5" />
        </div>
        <div className="flex h-full items-center justify-end bg-primary px-6 text-primary-foreground" style={{ width: Math.max(0, -swipeOffset) }}>
          <Check className="h-5 w-5" />
        </div>
      </div>

      {/* Foreground Habit Item */}
      <div
        className={cn(
          "relative flex items-start gap-4 border p-4 transition-transform duration-200 ease-in-out",
          isCompleted ? 'bg-primary/5 border-primary/20' : 'bg-card',
          isSwiping ? 'duration-0' : '',
        )}
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        <Checkbox
          id={`habit-${habit.id}`}
          checked={isCompleted}
          aria-label={`'${habit.name}' is ${isCompleted ? 'complete' : 'incomplete'}`}
          className="mt-1 h-5 w-5 pointer-events-none"
        />
        <div className="grid gap-1 flex-1">
          <label htmlFor={`habit-${habit.id}`} className="font-medium">
            {habit.name}
          </label>
          <p className="text-sm text-muted-foreground">{habit.description}</p>
        </div>
        <div className="flex flex-col items-end space-y-1 text-sm">
          <div className={`font-bold ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
            +{habit.points} pts
          </div>
          {habit.penalty > 0 && (
            <div className={`flex items-center gap-1 text-xs ${isCompleted ? 'text-muted-foreground/50' : 'text-destructive/80'}`}>
              <TrendingDown className="h-3 w-3" />
              <span>{habit.penalty} pts</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default function HabitList({ habits, completedHabitIds, onToggleHabit, onEditHabit, onDeleteHabit }: HabitListProps) {
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
      {habits.map(habit => (
        <HabitItem
          key={habit.id}
          habit={habit}
          isCompleted={completedHabitIds.includes(habit.id)}
          onToggleHabit={onToggleHabit}
          onEdit={() => onEditHabit(habit)}
          onDelete={() => onDeleteHabit(habit)}
        />
      ))}
    </div>
  );
}
