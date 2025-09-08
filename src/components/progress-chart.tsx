
'use client';

import * as React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { subDays, format, isFuture, isToday } from 'date-fns';
import type { HabitLog, Habit } from '@/lib/types';

interface ProgressChartProps {
  logs: HabitLog[];
  habits: Habit[];
}

export default function ProgressChart({ logs, habits }: ProgressChartProps) {
  const data = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), i)).reverse();

    const totalPossiblePoints = habits.reduce((sum, habit) => sum + habit.points, 0);

    return last7Days.map(date => {
      const dateString = format(date, 'yyyy-MM-dd');
      const log = logs.find(l => l.date === dateString);
      
      let completedPoints = 0;
      if (log) {
        completedPoints = log.completedHabits.reduce((sum, completed) => {
            const habit = habits.find(h => h.id === completed.habitId);
            return sum + (habit?.points || 0);
        }, 0);
      }
      
      const isFutureDate = isFuture(date) && !isToday(date);

      return {
        date: format(date, 'EEE'),
        fullDate: format(date, 'MMM d'),
        completed: isFutureDate ? null : completedPoints,
        total: totalPossiblePoints,
      };
    });
  }, [logs, habits]);

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            domain={[0, 'dataMax + 10']}
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={({ active, payload }) => {
                if (active && payload && payload.length) {
                    return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-1 gap-1">
                                <p className="text-sm font-medium">{payload[0].payload.fullDate}</p>
                                <p className="text-sm text-muted-foreground">
                                    Points Earned: {payload[0].value}
                                </p>
                            </div>
                        </div>
                    );
                }
                return null;
            }}
          />
          <Bar
            dataKey="completed"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

    