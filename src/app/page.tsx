'use client';

import * as React from 'react';
import { Plus, CheckCircle, Trophy, BarChart3, History, CalendarCheck, Star, Settings } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useHabits } from '@/hooks/use-habits';
import AddHabitDialog from '@/components/add-habit-dialog';
import EditHabitDialog from '@/components/edit-habit-dialog';
import DeleteHabitDialog from '@/components/delete-habit-dialog';
import HabitList from '@/components/habit-list';
import MotivationalQuote from '@/components/motivational-quote';
import ProductivityScore from '@/components/productivity-score';
import ProgressChart from '@/components/progress-chart';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getMonth, getYear } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import MilestoneDialog from '@/components/milestone-dialog';
import type { Habit } from '@/lib/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function DashboardPage() {
  const { habits, logs, addHabit, editHabit, deleteHabit, toggleHabit, monthlyTarget, setMonthlyTarget } = useHabits();
  const [isAddDialogOpen, setAddDialogOpen] = React.useState(false);
  const [isMilestoneOpen, setMilestoneOpen] = React.useState(false);
  const [milestone, setMilestone] = React.useState<number | null>(null);

  const [habitToEdit, setHabitToEdit] = React.useState<Habit | null>(null);
  const [habitToDelete, setHabitToDelete] = React.useState<Habit | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLog = logs.find(log => log.date === today);
  const todaysCompletedHabits = todayLog?.completedHabits || [];

  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const monthlyLogs = logs.filter(log => {
    const logDate = new Date(log.date);
    return getMonth(logDate) === getMonth(currentDate) && getYear(logDate) === getYear(currentDate);
  });

  const calculateScoreForDay = (completedIds: string[]) => {
    const completedScore = habits
      .filter(h => completedIds.includes(h.id))
      .reduce((sum, h) => sum + h.points, 0);

    const missedPenalty = habits
      .filter(h => h.penalty > 0 && !completedIds.includes(h.id))
      .reduce((sum, h) => sum + h.penalty, 0);

    return completedScore - missedPenalty;
  };
  
  const monthlyScore = monthlyLogs.reduce((total, log) => {
    return total + calculateScoreForDay(log.completedHabits);
  }, 0);

  const monthlyProgress = monthlyTarget > 0 ? (monthlyScore / monthlyTarget) * 100 : 0;

  React.useEffect(() => {
    const milestones = [100, 250, 500, 1000, 2000, 5000];
    const previousScore = monthlyScore - calculateScoreForDay(todaysCompletedHabits);

    for (const m of milestones) {
      if (previousScore < m && monthlyScore >= m) {
        setMilestone(m);
        setMilestoneOpen(true);
        break; // Show one milestone at a time
      }
    }
  }, [monthlyScore, todaysCompletedHabits, habits]);


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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              {format(currentDate, 'MMMM yyyy')} Progress
            </CardTitle>
            <CardDescription>You've earned <span className="font-bold text-primary">{monthlyScore}</span> points towards your goal of <span className="font-bold text-primary">{monthlyTarget}</span>.</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={monthlyProgress} className="w-full" />
          </CardContent>
        </Card>
        
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today"><Star className="mr-2 h-4 w-4" />Today</TabsTrigger>
            <TabsTrigger value="history"><History className="mr-2 h-4 w-4" />History</TabsTrigger>
          </TabsList>
          <TabsContent value="today" className="mt-6">
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
                      onEditHabit={setHabitToEdit}
                      onDeleteHabit={setHabitToDelete}
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
          </TabsContent>
          <TabsContent value="history" className="mt-6">
             <Card>
                <CardHeader>
                    <CardTitle>Monthly Log</CardTitle>
                    <CardDescription>Review your completed habits for each day of the current month.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {daysInMonth.map(day => {
                        const dayString = format(day, 'yyyy-MM-dd');
                        const log = logs.find(l => l.date === dayString);
                        const score = log ? calculateScoreForDay(log.completedHabits) : 0;
                        return (
                            <div key={dayString} className="flex items-center justify-between rounded-lg border p-3">
                               <div>
                                    <p className="font-semibold">{format(day, 'MMMM d, EEE')}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {log ? `${log.completedHabits.length} of ${habits.length} habits completed` : 'No entries'}
                                    </p>
                               </div>
                                <div className={`font-bold text-lg ${score > 0 ? 'text-green-600' : score < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>{score} pts</div>
                            </div>
                        )
                    })}
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </main>
      <AddHabitDialog
        open={isAddDialogOpen}
        onOpenChange={setAddDialogOpen}
        onHabitAdd={newHabit => {
          addHabit(newHabit);
          setAddDialogOpen(false);
        }}
      />
      {habitToEdit && (
        <EditHabitDialog
          open={!!habitToEdit}
          onOpenChange={(isOpen) => !isOpen && setHabitToEdit(null)}
          habit={habitToEdit}
          onHabitEdit={(editedHabit) => {
            editHabit(editedHabit);
            setHabitToEdit(null);
          }}
        />
      )}
      {habitToDelete && (
        <DeleteHabitDialog
          open={!!habitToDelete}
          onOpenChange={(isOpen) => !isOpen && setHabitToDelete(null)}
          habit={habitToDelete}
          onConfirmDelete={() => {
            deleteHabit(habitToDelete.id);
            setHabitToDelete(null);
          }}
        />
      )}
      {milestone && (
         <MilestoneDialog 
            open={isMilestoneOpen} 
            onOpenChange={setMilestoneOpen}
            milestone={milestone}
         />
      )}
    </div>
  );
}
