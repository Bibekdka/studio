
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
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';


export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(1000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHabits([]);
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const habitsQuery = query(collection(db, 'users', user.uid, 'habits'));
    const unsubscribeHabits = onSnapshot(habitsQuery, (snapshot) => {
      const serverHabits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
      setHabits(serverHabits);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching habits:", error);
      setLoading(false);
    });

    const logsQuery = query(collection(db, 'users', user.uid, 'logs'));
    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      const serverLogs = snapshot.docs.map(doc => doc.data() as HabitLog);
      setLogs(serverLogs);
    });
    
    const settingsRef = doc(db, 'users', user.uid, 'settings', 'general');
    const unsubscribeSettings = onSnapshot(settingsRef, (doc) => {
        if (doc.exists() && doc.data().monthlyTarget) {
            setMonthlyTarget(doc.data().monthlyTarget);
        } else {
            setMonthlyTarget(1000); // Default value
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
    // Note: You might want to remove this habit from all logs as well.
    // This is a complex operation and has been omitted for simplicity.
  }, [user]);

  const toggleHabit = useCallback(async (habitId: string) => {
    if (!user) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const logRef = doc(db, 'users', user.uid, 'logs', todayStr);
    
    try {
        const logDoc = await getDoc(logRef);
        
        if (logDoc.exists()) {
            const completedHabits: CompletedHabit[] = logDoc.data().completedHabits || [];
            const habitIndex = completedHabits.findIndex(h => h.habitId === habitId);

            if (habitIndex > -1) {
                 const habitToRemove = completedHabits[habitIndex];
                 await setDoc(logRef, { completedHabits: arrayRemove(habitToRemove) }, { merge: true });
            } else {
                const newCompletedHabit = { habitId, completedAt: Timestamp.now().toMillis() };
                await setDoc(logRef, { completedHabits: arrayUnion(newCompletedHabit) }, { merge: true });
            }
        } else {
            // No log for today, create one with the completed habit
            const newCompletedHabit = { habitId, completedAt: Timestamp.now().toMillis() };
            await setDoc(logRef, { date: todayStr, completedHabits: [newCompletedHabit] });
        }
    } catch (error) {
        console.error("Error toggling habit: ", error);
    }
  }, [user]);
  
  const updateMonthlyTarget = useCallback(async (newTarget: number) => {
      if (!user) return;
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'general');
      await setDoc(settingsRef, { monthlyTarget: newTarget }, { merge: true });
  }, [user]);


  return { habits, logs, addHabit, editHabit, deleteHabit, toggleHabit, monthlyTarget, setMonthlyTarget: updateMonthlyTarget, loading };
}
