
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Habit, HabitLog } from '@/lib/types';
import { format } from 'date-fns';
import { useAuth } from '@/components/auth-provider';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  writeBatch,
  query,
  onSnapshot,
  deleteDoc,
  setDoc,
  getDoc,
  getDocs,
  Timestamp,
} from 'firebase/firestore';

const LOCAL_STORAGE_KEYS = {
  habits: 'habit-journey-habits',
  logs: 'habit-journey-logs',
  target: 'habit-journey-target'
};

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(1000);
  const [loading, setLoading] = useState(true);

  // --- Data migration ---
  const migrateLocalDataToFirestore = useCallback(async (userId: string) => {
    console.log("Starting data migration from local storage to Firestore...");
    setLoading(true);
    try {
        const localHabitsJSON = localStorage.getItem(LOCAL_STORAGE_KEYS.habits);
        const localLogsJSON = localStorage.getItem(LOCAL_STORAGE_KEYS.logs);
        const localTargetJSON = localStorage.getItem(LOCAL_STORAGE_KEYS.target);

        const localHabits: Habit[] = localHabitsJSON ? JSON.parse(localHabitsJSON) : [];
        const localLogs: HabitLog[] = localLogsJSON ? JSON.parse(localLogsJSON) : [];
        const localTarget: number = localTargetJSON ? JSON.parse(localTargetJSON) : 1000;

        if (localHabits.length === 0 && localLogs.length === 0) {
            console.log("No local data to migrate.");
            return;
        }

        const batch = writeBatch(db);

        // Migrate habits
        const habitsCollectionRef = collection(db, 'users', userId, 'habits');
        localHabits.forEach(habit => {
            const habitRef = doc(habitsCollectionRef, habit.id);
            batch.set(habitRef, habit);
        });

        // Migrate logs
        const logsCollectionRef = collection(db, 'users', userId, 'logs');
        localLogs.forEach(log => {
            const logRef = doc(logsCollectionRef, log.date);
            batch.set(logRef, log);
        });
        
        // Migrate target
        const settingsRef = doc(db, 'users', userId, 'settings', 'general');
        batch.set(settingsRef, { monthlyTarget: localTarget }, { merge: true });

        await batch.commit();
        console.log("Data migration successful!");

        // Clear local storage after successful migration
        localStorage.removeItem(LOCAL_STORAGE_KEYS.habits);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.logs);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.target);

    } catch (error) {
        console.error("Error migrating data:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  // Effect to trigger migration when user signs in
  useEffect(() => {
    if (user) {
      migrateLocalDataToFirestore(user.uid);
    }
  }, [user, migrateLocalDataToFirestore]);

  // --- Local Storage Management ---
  const getLocalHabits = useCallback(() => {
    const savedHabits = localStorage.getItem(LOCAL_STORAGE_KEYS.habits);
    return savedHabits ? JSON.parse(savedHabits) : [];
  }, []);

  const getLocalLogs = useCallback(() => {
    const savedLogs = localStorage.getItem(LOCAL_STORAGE_KEYS.logs);
    return savedLogs ? JSON.parse(savedLogs) : [];
  }, []);
  
  const getLocalTarget = useCallback(() => {
    const savedTarget = localStorage.getItem(LOCAL_STORAGE_KEYS.target);
    return savedTarget ? JSON.parse(savedTarget) : 1000;
  }, []);

  // --- Main data loading effect ---
  useEffect(() => {
    setLoading(true);
    if (user) {
        // User is logged in, use Firestore
        const habitsQuery = query(collection(db, 'users', user.uid, 'habits'));
        const unsubscribeHabits = onSnapshot(habitsQuery, (snapshot) => {
            setHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit)));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching habits:", error);
            setLoading(false);
        });

        const logsQuery = query(collection(db, 'users', user.uid, 'logs'));
        const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
            setLogs(snapshot.docs.map(doc => doc.data() as HabitLog));
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
    } else {
        // User is not logged in, use local storage
        setHabits(getLocalHabits());
        setLogs(getLocalLogs());
        setMonthlyTarget(getLocalTarget());
        setLoading(false);
    }
  }, [user, getLocalHabits, getLocalLogs, getLocalTarget]);

  // --- Data manipulation functions ---
  const addHabit = useCallback(async (habitData: Omit<Habit, 'id'>) => {
    const newId = doc(collection(db, 'users', 'placeholer', 'habits')).id;
    const newHabit: Habit = { ...habitData, id: newId };

    if (user) {
        const habitRef = doc(db, 'users', user.uid, 'habits', newHabit.id);
        await setDoc(habitRef, newHabit);
    } else {
        const updatedHabits = [...habits, newHabit];
        setHabits(updatedHabits);
        localStorage.setItem(LOCAL_STORAGE_KEYS.habits, JSON.stringify(updatedHabits));
    }
  }, [user, habits]);

  const editHabit = useCallback(async (updatedHabit: Habit) => {
    if (user) {
        const habitRef = doc(db, 'users', user.uid, 'habits', updatedHabit.id);
        await setDoc(habitRef, updatedHabit, { merge: true });
    } else {
        const updatedHabits = habits.map(h => h.id === updatedHabit.id ? updatedHabit : h);
        setHabits(updatedHabits);
        localStorage.setItem(LOCAL_STORAGE_KEYS.habits, JSON.stringify(updatedHabits));
    }
  }, [user, habits]);

  const deleteHabit = useCallback(async (habitId: string) => {
    if (user) {
        const habitRef = doc(db, 'users', user.uid, 'habits', habitId);
        await deleteDoc(habitRef);
    } else {
        const updatedHabits = habits.filter(h => h.id !== habitId);
        setHabits(updatedHabits);
        localStorage.setItem(LOCAL_STORAGE_KEYS.habits, JSON.stringify(updatedHabits));
    }
  }, [user, habits]);

  const toggleHabit = useCallback(async (habitId: string) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const newCompletedHabit = { habitId, completedAt: Timestamp.now().toMillis() };

    const updateLogs = (currentLogs: HabitLog[]): HabitLog[] => {
        const logIndex = currentLogs.findIndex(l => l.date === todayStr);
        let updatedLogs = [...currentLogs];

        if (logIndex > -1) {
            const logToUpdate = { ...updatedLogs[logIndex] };
            const habitIndex = logToUpdate.completedHabits.findIndex(h => h.habitId === habitId);
            if (habitIndex > -1) {
                logToUpdate.completedHabits.splice(habitIndex, 1);
            } else {
                logToUpdate.completedHabits.push(newCompletedHabit);
            }
            updatedLogs[logIndex] = logToUpdate;
        } else {
            updatedLogs.push({ date: todayStr, completedHabits: [newCompletedHabit] });
        }
        return updatedLogs;
    };
    
    if (user) {
        const logRef = doc(db, 'users', user.uid, 'logs', todayStr);
        const logDoc = await getDoc(logRef);
        const currentLog = logDoc.exists() ? logDoc.data() as HabitLog : { date: todayStr, completedHabits: [] };
        const updatedLog = updateLogs([currentLog])[0];
        await setDoc(logRef, updatedLog, { merge: true });
    } else {
        const updatedLogs = updateLogs(logs);
        setLogs(updatedLogs);
        localStorage.setItem(LOCAL_STORAGE_KEYS.logs, JSON.stringify(updatedLogs));
    }
  }, [user, logs]);
  
  const updateMonthlyTarget = useCallback(async (newTarget: number) => {
      if (user) {
        const settingsRef = doc(db, 'users', user.uid, 'settings', 'general');
        await setDoc(settingsRef, { monthlyTarget: newTarget }, { merge: true });
      } else {
        setMonthlyTarget(newTarget);
        localStorage.setItem(LOCAL_STORAGE_KEYS.target, JSON.stringify(newTarget));
      }
  }, [user]);

  return { habits, logs, addHabit, editHabit, deleteHabit, toggleHabit, monthlyTarget, setMonthlyTarget: updateMonthlyTarget, loading };
}
