import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../db";
import { habits, logs, Habit } from "@/db";
import { getAllHabitStreaks } from "@/db";
import { eq, and } from "drizzle-orm";
import * as Haptics from "expo-haptics";

type DailyLog = Habit & { completed: boolean };

interface HabitsContextType {
  habitsList: Habit[];
  dailyHabits: DailyLog[];
  streaks: Record<number, number>;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  addHabit: (name: string) => Promise<void>;
  removeHabit: (id: number) => Promise<void>;
  toggleHabit: (id: number) => Promise<void>;
  refreshHabits: () => Promise<void>;
}

const HabitsContext = createContext<HabitsContextType | null>(null);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habitsList, setHabits] = useState<Habit[]>([]);
  const [dailyHabits, setDailyHabits] = useState<DailyLog[]>([]);
  const [streaks, setStreaks] = useState<Record<number, number>>({});
  const [selectedDate, setSelectedDate] = useState(new Date());

  const loadHabits = async (date: Date) => {
    try {
      const dateString = date.toISOString().split("T")[0];

      // Get all habits
      const allHabits = await db.select().from(habits);

      // Get logs for selected date
      const existingLogs = await db
        .select()
        .from(logs)
        .where(eq(logs.date, dateString));

      const dateLogs: DailyLog[] = allHabits.map((habit) => ({
        ...habit,
        completed: existingLogs.some((log) => log.habit_id === habit.id),
      }));

      setDailyHabits(dateLogs);
      setHabits(allHabits);

      // Load streaks
      const s = await getAllHabitStreaks();
      setStreaks(s);
    } catch (error) {
      console.error("Error loading habits:", error);
    }
  };

  const loadDailyHabits = async (date: Date) => {
    try {
      const dateString = date.toISOString().split("T")[0];

      // Get logs for selected date
      const existingLogs = await db
        .select()
        .from(logs)
        .where(eq(logs.date, dateString));

      const dateLogs: DailyLog[] = habitsList.map((habit) => ({
        ...habit,
        completed: existingLogs.some((log) => log.habit_id === habit.id),
      }));

      setDailyHabits(dateLogs);
    } catch (error) {
      console.error("Error loading day's habits:", error);
    }
  };

  useEffect(() => {
    loadHabits(selectedDate);
  }, [selectedDate]);

  const addHabit = async (name: string) => {
    try {
      await db.insert(habits).values({ name });
      loadHabits(selectedDate);
    } catch (error) {
      console.error("Error adding habit:", error);
    }
  };

  const removeHabit = async (id: number) => {
    try {
      await db.delete(habits).where(eq(habits.id, id));
      loadHabits(selectedDate);
    } catch (error) {
      console.error("Error removing habit:", error);
    }
  };

  const toggleHabit = async (id: number) => {
    try {
      const dateString = selectedDate.toISOString().split("T")[0];

      const existingLog = await db
        .select()
        .from(logs)
        .where(and(eq(logs.habit_id, id), eq(logs.date, dateString)))
        .get();

      if (existingLog) {
        await db
          .delete(logs)
          .where(and(eq(logs.habit_id, id), eq(logs.date, dateString)));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        await db.insert(logs).values({
          habit_id: id,
          date: dateString,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      loadDailyHabits(selectedDate);
      // Refresh streaks after toggle
      getAllHabitStreaks().then(setStreaks);
    } catch (error) {
      console.error("Error toggling habit:", error);
    }
  };

  const refreshHabits = () => loadHabits(selectedDate);

  return (
    <HabitsContext.Provider
      value={{
        habitsList,
        dailyHabits,
        streaks,
        selectedDate,
        setSelectedDate,
        addHabit,
        removeHabit,
        toggleHabit,
        refreshHabits,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error("useHabitsContext must be used within a HabitsProvider");
  }
  return context;
}
