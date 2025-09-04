'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Habit, HabitLog } from '@/lib/types';
import { format } from 'date-fns';

const HABITS_STORAGE_KEY = 'habit-journey-habits';
const LOGS_STORAGE_KEY = 'habit-journey-logs';

const getInitialHabits = (): Habit[] => {
  return [
    { id: '1', name: 'Read for 15 minutes', description: 'Read a book or an article.', points: 10 },
    { id: '2', name: 'Morning workout', description: 'A 20-minute exercise session.', points: 20 },
    { id: '3', name: 'Meditate', description: '5 minutes of mindfulness meditation.', points: 15 },
    { id: '4', name: 'Drink 8 glasses of water', description: 'Stay hydrated throughout the day.', points: 5 },
  ];
};

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedHabits = localStorage.getItem(HABITS_STORAGE_KEY);
      const storedLogs = localStorage.getItem(LOGS_STORAGE_KEY);

      if (storedHabits) {
        setHabits(JSON.parse(storedHabits));
      } else {
        setHabits(getInitialHabits());
      }

      if (storedLogs) {
        setLogs(JSON.parse(storedLogs));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      setHabits(getInitialHabits());
      setLogs([]);
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

  const addHabit = useCallback((habitData: Omit<Habit, 'id'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: new Date().toISOString(),
    };
    setHabits(prevHabits => [...prevHabits, newHabit]);
  }, []);

  const toggleHabit = useCallback((habitId: string) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    setLogs(prevLogs => {
      const newLogs = [...prevLogs];
      const todayLogIndex = newLogs.findIndex(log => log.date === todayStr);

      if (todayLogIndex > -1) {
        const todayLog = { ...newLogs[todayLogIndex] };
        const completedIndex = todayLog.completedHabits.indexOf(habitId);

        if (completedIndex > -1) {
          todayLog.completedHabits.splice(completedIndex, 1);
        } else {
          todayLog.completedHabits.push(habitId);
        }
        newLogs[todayLogIndex] = todayLog;
      } else {
        newLogs.push({ date: todayStr, completedHabits: [habitId] });
      }
      return newLogs;
    });
  }, []);

  return { habits, logs, addHabit, toggleHabit, isLoaded };
}
