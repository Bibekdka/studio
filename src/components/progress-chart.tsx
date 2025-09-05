'use client';

import * as React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { subDays, format } from 'date-fns';
import type { HabitLog } from '@/lib/types';

interface ProgressChartProps {
  logs: HabitLog[];
}

export default function ProgressChart({ logs }: ProgressChartProps) {
  const data = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), i)).reverse();

    return last7Days.map(date => {
      const dateString = format(date, 'yyyy-MM-dd');
      const log = logs.find(l => l.date === dateString);
      return {
        date: format(date, 'EEE'),
        fullDate: format(date, 'MMM d'),
        completed: log ? log.completedHabits.length : 0,
      };
    });
  }, [logs]);

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
                                    Completed: {payload[0].value}
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
