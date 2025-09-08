
'use client';

import * as React from 'react';
import { Plus, CheckCircle, Trophy, BarChart3, History, CalendarCheck, Star, LogOut, LogIn, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getYear, getMonth, parseISO, isToday, isFuture } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth-provider';
import { useHabits } from '@/hooks/use-habits';
import type { Habit } from '@/lib/types';
import AddHabitDialog from '@/components/add-habit-dialog';
import EditHabitDialog from '@/components/edit-habit-dialog';
import DeleteHabitDialog from '@/components/delete-habit-dialog';
import HabitList from '@/components/habit-list';
import MotivationalQuote from '@/components/motivational-quote';
import ProductivityScore from '@/components/productivity-score';
import ProgressChart from '@/components/progress-chart';
import MilestoneDialog from '@/components/milestone-dialog';

export default function DashboardPage() {
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const { habits, logs, addHabit, editHabit, deleteHabit, toggleHabit, monthlyTarget, loading: habitsLoading } = useHabits();
  const router = useRouter();
  const { toast } = useToast();

  const [isAddDialogOpen, setAddDialogOpen] = React.useState(false);
  const [isMilestoneOpen, setMilestoneOpen] = React.useState(false);
  const [milestone, setMilestone] = React.useState<number | null>(null);
  const [habitToEdit, setHabitToEdit] = React.useState<Habit | null>(null);
  const [habitToDelete, setHabitToDelete] = React.useState<Habit | null>(null);

  const [currentDate] = React.useState(new Date());

  const calculateScoreForDay = React.useCallback((completedHabitIds: string[], targetHabits: Habit[]) => {
    let score = 0;
    targetHabits.forEach(habit => {
      if (completedHabitIds.includes(habit.id)) {
        score += habit.points;
      } else {
        score -= habit.penalty;
      }
    });
    return Math.max(0, score);
  }, []);

  const { monthlyScore, todaysCompletedHabitIds } = React.useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    let todaysCompletedHabitIds: string[] = [];

    const monthlyLogs = logs.filter(log => {
      try {
        const logDate = parseISO(log.date);
        return getYear(logDate) === getYear(currentDate) && getMonth(logDate) === getMonth(currentDate);
      } catch (e) {
        return false;
      }
    });

    const score = monthlyLogs.reduce((total, log) => {
      const completedIds = log.completedHabits.map(c => c.habitId);
      if(log.date === today) {
        todaysCompletedHabitIds = completedIds;
      }
      return total + calculateScoreForDay(completedIds, habits);
    }, 0);

    return { monthlyScore: score, todaysCompletedHabitIds };
  }, [logs, habits, currentDate, calculateScoreForDay]);

  const monthlyProgress = monthlyTarget > 0 ? (monthlyScore / monthlyTarget) * 100 : 0;

  React.useEffect(() => {
    const milestones = [100, 250, 500, 1000, 2000, 5000];
    const scoreToday = calculateScoreForDay(todaysCompletedHabitIds, habits);
    const previousScore = monthlyScore - scoreToday;

    for (const m of milestones) {
      if (previousScore < m && monthlyScore >= m) {
        setMilestone(m);
        setMilestoneOpen(true);
        break;
      }
    }
  }, [monthlyScore, todaysCompletedHabitIds, habits, calculateScoreForDay]);

  if (authLoading || habitsLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading your journey...</p>
        </div>
      </div>
    );
  }

  const daysInMonth = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
  const todayLog = logs.find(log => log.date === format(new Date(), 'yyyy-MM-dd'));

  const handleAuthAction = () => {
    if (user) {
      signOut();
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
    } else {
      signInWithGoogle().catch(err => {
        console.error("Sign in failed:", err);
        toast({
            title: "Sign In Failed",
            description: "Could not sign you in. Please try again.",
            variant: "destructive"
        })
      });
    }
  };

  const hasHabits = habits.length > 0;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 md:p-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Habit Journey</h1>
            <p className="text-muted-foreground">
              {user ? `Welcome back, ${user.displayName || 'friend'}!` : 'Track your habits, build your future.'}
            </p>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <Button onClick={() => setAddDialogOpen(true)} className="w-full flex-grow sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add New Habit
            </Button>
            <Button variant="outline" size="icon" onClick={handleAuthAction} title={user ? 'Sign Out' : 'Sign In'}>
                {user ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                <span className="sr-only">{user ? 'Sign Out' : 'Sign In'}</span>
            </Button>
          </div>
        </header>

        {hasHabits ? (
          <>
            <MotivationalQuote habits={habits} />
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
                          completedHabits={todayLog?.completedHabits || []}
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
                          completedHabitIds={todaysCompletedHabitIds}
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
                        <ProgressChart logs={logs} habits={habits} />
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
                            
                            if (isFuture(day) && !isToday(day)) {
                                return (
                                    <div key={dayString} className="flex items-center justify-between rounded-lg border p-3 bg-muted/50">
                                       <div>
                                            <p className="font-semibold text-muted-foreground">{format(day, 'MMMM d, EEE')}</p>
                                            <p className="text-sm text-muted-foreground">Upcoming</p>
                                       </div>
                                    </div>
                                )
                            }

                            let score = 0;
                            if (log) {
                                score = calculateScoreForDay(log.completedHabits.map(c => c.habitId), habits);
                            } else if (!isFuture(day)) {
                                score = -habits.reduce((sum, h) => sum + h.penalty, 0);
                            }
                            
                            const scoreDisplay = Math.max(0, score);


                            return (
                                <div key={dayString} className={`flex items-center justify-between rounded-lg border p-3 ${isToday(day) ? 'bg-primary/5' : ''}`}>
                                   <div>
                                        <p className="font-semibold">{format(day, 'MMMM d, EEE')}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {log ? `${log.completedHabits.length} of ${habits.length} habits completed` : (!isFuture(day) ? `0 of ${habits.length} habits completed` : 'No entries')}
                                        </p>
                                   </div>
                                    <div className={`font-bold text-lg ${score > 0 ? 'text-primary' : score < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>{!isFuture(day) ? `${scoreDisplay} pts` : ''}</div>
                                </div>
                            )
                        })}
                    </CardContent>
                 </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card className="flex flex-col items-center justify-center py-20 text-center">
             <CardHeader>
                <Target className="mx-auto h-16 w-16 text-primary/70" />
                <CardTitle className="mt-4 text-2xl font-bold">Start Your Journey</CardTitle>
                <CardDescription>
                  Welcome to Habit Journey! Add your first habit to begin tracking your progress and building a better you.
                </CardDescription>
             </CardHeader>
             <CardContent>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Habit
                </Button>
             </CardContent>
          </Card>
        )}

      </main>
      <AddHabitDialog
        open={isAddDialogOpen}
        onOpenChange={setAddDialogOpen}
        onHabitAdd={newHabit => {
          addHabit(newHabit);
          setAddDialogOpen(false);
          toast({
            title: "Habit Added!",
            description: `Your new habit "${newHabit.name}" has been successfully created.`,
          });
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
            toast({
              title: "Habit Updated!",
              description: `Your habit "${editedHabit.name}" has been saved.`,
            });
          }}
        />
      )}
      {habitToDelete && (
        <DeleteHabitDialog
          open={!!habitToDelete}
          onOpenChange={(isOpen) => !isOpen && setHabitToDelete(null)}
          habit={habitToDelete}
          onConfirmDelete={() => {
            if (!habitToDelete) return;
            toast({
              title: "Habit Deleted",
              description: `The habit "${habitToDelete.name}" has been removed.`,
              variant: "destructive",
            });
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

    