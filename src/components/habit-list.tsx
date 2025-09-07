
'use client';

import * as React from 'react';
import { MoreVertical, Edit, Trash2, Target, TrendingDown, BrainCircuit, Dumbbell, Book, Leaf, Coffee, Code, Pen, Droplets, Bed, CookingPot, DollarSign, Heart } from 'lucide-react';

import type { Habit, CompletedHabit } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const habitIcons: { [key: string]: React.ReactNode } = {
  Dumbbell: <Dumbbell />,
  Book: <Book />,
  Leaf: <Leaf />,
  Coffee: <Coffee />,
  Code: <Code />,
  Pen: <Pen />,
  Droplets: <Droplets />,
  Bed: <Bed />,
  CookingPot: <CookingPot />,
  DollarSign: <DollarSign />,
  Heart: <Heart />,
  BrainCircuit: <BrainCircuit />,
};

interface HabitListProps {
  habits: Habit[];
  completedHabits: CompletedHabit[];
  onToggleHabit: (habitId: string) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habit: Habit) => void;
}

function HabitItem({
  habit,
  isCompleted,
  onToggle,
  onEdit,
  onDelete,
}: {
  habit: Habit;
  isCompleted: boolean;
  onToggle: (id: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const Icon = habitIcons[habit.icon] || <BrainCircuit />;

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
       <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
          {React.cloneElement(Icon as React.ReactElement, { className: "h-5 w-5"})}
       </div>
      <div className="grid gap-1 flex-1 cursor-pointer" onClick={() => onToggle(habit.id)}>
        <p className="font-medium">
          {habit.name}
        </p>
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
        <Checkbox
            checked={isCompleted}
            onCheckedChange={() => onToggle(habit.id)}
            aria-label={`Mark ${habit.name} as complete`}
            className="h-6 w-6"
        />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function HabitList({ habits, completedHabits, onToggleHabit, onEditHabit, onDeleteHabit }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <div className="text-center py-10">
        <Target className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No Habits Yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Click "Add New Habit" to get started.</p>
      </div>
    );
  }

  const completedHabitIds = completedHabits.map(c => c.habitId);

  return (
    <div className="space-y-4">
      {habits.map(habit => (
        <HabitItem
          key={habit.id}
          habit={habit}
          isCompleted={completedHabitIds.includes(habit.id)}
          onToggle={onToggleHabit}
          onEdit={() => onEditHabit(habit)}
          onDelete={() => onDeleteHabit(habit)}
        />
      ))}
    </div>
  );
}
