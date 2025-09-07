'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Habit, HabitLog, CompletedHabit } from '@/lib/types';
import { format } from 'date-fns';
import { useAuth } from '@/components/auth-provider';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  writeBatch,
  query,
  getDocs,
  onSnapshot,
  deleteDoc,
  setDoc,
  getDoc,
} from 'firebase/firestore';


export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(1000);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setHabits([]);
      setLogs([]);
      setIsLoaded(true);
      return;
    }

    const habitsRef = collection(db, 'users', user.uid, 'habits');
    const unsubscribeHabits = onSnapshot(query(habitsRef), (snapshot) => {
      const serverHabits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
      setHabits(serverHabits);
      setIsLoaded(true);
    });

    const logsRef = collection(db, 'users', user.uid, 'logs');
    const unsubscribeLogs = onSnapshot(query(logsRef), (snapshot) => {
      const serverLogs = snapshot.docs.map(doc => doc.data() as HabitLog);
      setLogs(serverLogs);
    });
    
    const settingsRef = doc(db, 'users', user.uid, 'settings', 'general');
    const unsubscribeSettings = onSnapshot(settingsRef, (doc) => {
        if (doc.exists()) {
            setMonthlyTarget(doc.data().monthlyTarget || 1000);
        }
    });

    return () => {
      unsubscribeHabits();
      unsubscribeLogs();
      unsubscribeSettings();
    };
  }, [user]);

  const addHabit = useCallback(async (habitData: Omit<Habit, 'id'>) => {
    if (!user) return;
    const newDocRef = doc(collection(db, 'users', user.uid, 'habits'));
    const newHabit: Habit = {
      ...habitData,
      id: newDocRef.id,
    };
    await setDoc(newDocRef, newHabit);
  }, [user]);

  const editHabit = useCallback(async (updatedHabit: Habit) => {
    if (!user) return;
    const habitRef = doc(db, 'users', user.uid, 'habits', updatedHabit.id);
    await setDoc(habitRef, updatedHabit, { merge: true });
  }, [user]);

  const deleteHabit = useCallback(async (habitId: string) => {
    if (!user) return;
    const habitRef = doc(db, 'users', user.uid, 'habits', habitId);
    await deleteDoc(habitRef);
    // Firestore security rules should handle cleaning up logs, or a cloud function.
    // For client-side, we'll just let the onSnapshot update the state.
  }, [user]);

  const toggleHabit = useCallback(async (habitId: string) => {
    if (!user) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const logRef = doc(db, 'users', user.uid, 'logs', todayStr);
    
    const logDoc = await getDoc(logRef);
    let currentCompleted: CompletedHabit[] = [];

    if (logDoc.exists()) {
      currentCompleted = logDoc.data().completedHabits || [];
    }

    const completedIndex = currentCompleted.findIndex(c => c.habitId === habitId);

    if (completedIndex > -1) {
      currentCompleted.splice(completedIndex, 1);
    } else {
      currentCompleted.push({ habitId, completedAt: new Date().toISOString() });
    }

    await setDoc(logRef, { date: todayStr, completedHabits: currentCompleted }, { merge: true });

  }, [user]);
  
  const updateMonthlyTarget = useCallback(async (newTarget: number) => {
      if (!user) return;
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'general');
      await setDoc(settingsRef, { monthlyTarget: newTarget }, { merge: true });
  }, [user]);


  return { habits, logs, addHabit, editHabit, deleteHabit, toggleHabit, monthlyTarget, setMonthlyTarget: updateMonthlyTarget, isLoaded };
}
