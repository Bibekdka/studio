'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Habit, HabitLog, CompletedHabit } from '@/lib/types';
import { format } from 'date-fns';

const HABITS_STORAGE_KEY = 'habit-journey-habits';
const LOGS_STORAGE_KEY = 'habit-journey-logs';
const TARGET_STORAGE_KEY = 'habit-journey-target';

const getInitialHabits = (): Habit[] => {
  return [
    { id: '1', name: 'Read for 15 minutes', description: 'Read a book or an article.', points: 10, penalty: 5 },
    { id: '2', name: 'Morning workout', description: 'A 20-minute exercise session.', points: 20, penalty: 10 },
    { id: '3', name: 'Meditate', description: '5 minutes of mindfulness meditation.', points: 15, penalty: 0 },
    { id: '4', name: 'Drink 8 glasses of water', description: 'Stay hydrated throughout the day.', points: 5, penalty: 0 },
  ];
};

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(1000);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedHabits = localStorage.getItem(HABITS_STORAGE_KEY);
      const storedLogs = localStorage.getItem(LOGS_STORAGE_KEY);
      const storedTarget = localStorage.getItem(TARGET_STORAGE_KEY);

      if (storedHabits) {
        const parsedHabits = JSON.parse(storedHabits).map((h: Habit) => ({ penalty: 0, ...h }));
        setHabits(parsedHabits);
      } else {
        setHabits(getInitialHabits());
      }

      if (storedLogs) {
        // Migration for logs from string[] to object[]
        const parsedLogs: HabitLog[] = JSON.parse(storedLogs).map((log: any) => {
            if (log.completedHabits.length > 0 && typeof log.completedHabits[0] === 'string') {
                return {
                    ...log,
                    completedHabits: log.completedHabits.map((habitId: string) => ({ habitId, completedAt: new Date().toISOString() }))
                };
            }
            return log;
        });
        setLogs(parsedLogs);
      }
      if (storedTarget) {
        setMonthlyTarget(JSON.parse(storedTarget));
      }

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      setHabits(getInitialHabits());
      setLogs([]);
      setMonthlyTarget(1000);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
      } catch (error) {
        console.error("Failed to save habits to localStorage", error);
      }
    }
  }, [habits, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
      } catch (error) {
        console.error("Failed to save logs to localStorage", error);
      }
    }
  }, [logs, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(TARGET_STORAGE_KEY, JSON.stringify(monthlyTarget));
      } catch (error) {
        console.error("Failed to save monthly target to localStorage", error);
      }
    }
  }, [monthlyTarget, isLoaded]);

  const addHabit = useCallback((habitData: Omit<Habit, 'id'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: new Date().toISOString(),
    };
    setHabits(prevHabits => [...prevHabits, newHabit]);
  }, []);

  const editHabit = useCallback((updatedHabit: Habit) => {
    setHabits(prevHabits => 
      prevHabits.map(habit => 
        habit.id === updatedHabit.id ? updatedHabit : habit
      )
    );
  }, []);

  const deleteHabit = useCallback((habitId: string) => {
    setHabits(prevHabits => prevHabits.filter(habit => habit.id !== habitId));
    // Also remove from logs
    setLogs(prevLogs => 
        prevLogs.map(log => ({
            ...log,
            completedHabits: log.completedHabits.filter(c => c.habitId !== habitId)
        }))
    );
  }, []);

  const toggleHabit = useCallback((habitId: string) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    setLogs(prevLogs => {
      const newLogs = [...prevLogs];
      const todayLogIndex = newLogs.findIndex(log => log.date === todayStr);

      if (todayLogIndex > -1) {
        const todayLog = { ...newLogs[todayLogIndex] };
        const completedIndex = todayLog.completedHabits.findIndex(c => c.habitId === habitId);

        if (completedIndex > -1) {
          todayLog.completedHabits.splice(completedIndex, 1);
        } else {
          todayLog.completedHabits.push({ habitId, completedAt: new Date().toISOString() });
        }
        newLogs[todayLogIndex] = todayLog;
      } else {
        newLogs.push({ date: todayStr, completedHabits: [{ habitId, completedAt: new Date().toISOString() }] });
      }
      return newLogs;
    });
  }, []);

  return { habits, logs, addHabit, editHabit, deleteHabit, toggleHabit, monthlyTarget, setMonthlyTarget, isLoaded };
}
