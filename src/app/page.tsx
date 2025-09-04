'use client';

import * as React from 'react';
import { Plus, CheckCircle, Trophy, BarChart3, Quote } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useHabits } from '@/hooks/use-habits';
import AddHabitDialog from '@/components/add-habit-dialog';
import HabitList from '@/components/habit-list';
import MotivationalQuote from '@/components/motivational-quote';
import ProductivityScore from '@/components/productivity-score';
import ProgressChart from '@/components/progress-chart';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { habits, logs, addHabit, toggleHabit } = useHabits();
  const [isAddDialogOpen, setAddDialogOpen] = React.useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLog = logs.find(log => log.date === today);
  const todaysCompletedHabits = todayLog?.completedHabits || [];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 md:p-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Habit Journey</h1>
            <p className="text-muted-foreground">Your path to a more consistent and productive you.</p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add New Habit
          </Button>
        </header>

        {habits.length > 0 && <MotivationalQuote habits={habits} />}
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-7 lg:gap-8">
          <div className="lg:col-span-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Today's Habits
                </CardTitle>
                <CardDescription>
                  Check off your habits for {format(new Date(), 'MMMM d, yyyy')}. Keep the streak going!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HabitList
                  habits={habits}
                  completedHabitIds={todaysCompletedHabits}
                  onToggleHabit={toggleHabit}
                />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Daily Productivity
                </CardTitle>
                <CardDescription>
                  Your AI-powered productivity score for today.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductivityScore
                  habits={habits}
                  completedHabitIds={todaysCompletedHabits}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Weekly Progress
                </CardTitle>
                <CardDescription>
                  Visualize your habit completion over the last 7 days.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProgressChart logs={logs} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <AddHabitDialog
        open={isAddDialogOpen}
        onOpenChange={setAddDialogOpen}
        onHabitAdd={newHabit => {
          addHabit(newHabit);
          setAddDialogOpen(false);
        }}
      />
    </div>
  );
}
