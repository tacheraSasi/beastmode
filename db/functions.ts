import { and, between, desc, eq, isNull, sql, sum } from "drizzle-orm";
import { db } from "./client";
import {
  dailyStats,
  goals,
  habits,
  logs,
  sessions,
  type Goal,
  type Session,
} from "./schema";

// ─── Habits ──────────────────────────────────────────────

export async function getAllHabits() {
  return db.select().from(habits);
}

export async function addHabit(name: string) {
  return db.insert(habits).values({ name });
}

export async function removeHabit(id: number) {
  await db.delete(logs).where(eq(logs.habit_id, id));
  return db.delete(habits).where(eq(habits.id, id));
}

// ─── Habit Logs ──────────────────────────────────────────

export async function getLogsForDate(date: Date) {
  const dateString = date.toISOString().split("T")[0];
  return db.select().from(logs).where(eq(logs.date, dateString));
}

export async function toggleHabitLog(habitId: number, date: Date) {
  const dateString = date.toISOString().split("T")[0];
  const existing = await db
    .select()
    .from(logs)
    .where(and(eq(logs.habit_id, habitId), eq(logs.date, dateString)));

  if (existing.length > 0) {
    return db
      .delete(logs)
      .where(and(eq(logs.habit_id, habitId), eq(logs.date, dateString)));
  } else {
    return db.insert(logs).values({ habit_id: habitId, date: dateString });
  }
}

// ─── Goals ───────────────────────────────────────────────

export async function getAllGoals() {
  return db.select().from(goals);
}

export async function getGoalById(id: number) {
  const rows = await db.select().from(goals).where(eq(goals.id, id));
  return rows[0] ?? null;
}

export async function createGoal(data: {
  name: string;
  icon?: string;
  goalHours?: number;
  reminderHour?: number | null;
  reminderMinute?: number | null;
}) {
  return db.insert(goals).values({
    name: data.name,
    icon: data.icon,
    goalHours: data.goalHours ?? 100,
    reminderHour: data.reminderHour ?? null,
    reminderMinute: data.reminderMinute ?? null,
  });
}

export async function updateGoal(
  id: number,
  data: Partial<Pick<Goal, "name" | "icon" | "goalHours" | "reminderHour" | "reminderMinute">>,
) {
  return db
    .update(goals)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(goals.id, id));
}

export async function deleteGoal(id: number) {
  await db.delete(dailyStats).where(eq(dailyStats.goalId, id));
  await db.delete(sessions).where(eq(sessions.goalId, id));
  return db.delete(goals).where(eq(goals.id, id));
}

export async function getGoalProgress(goalId: number) {
  const result = await db
    .select({
      totalSeconds: sum(sessions.durationSeconds),
    })
    .from(sessions)
    .where(eq(sessions.goalId, goalId));

  const totalSeconds = Number(result[0]?.totalSeconds ?? 0);
  return {
    totalSeconds,
    totalHours: totalSeconds / 3600,
  };
}

// ─── Sessions ────────────────────────────────────────────

export async function startSession(goalId: number, notes?: string) {
  return db.insert(sessions).values({
    goalId,
    startTime: new Date(),
    notes,
  });
}

export async function endSession(sessionId: number) {
  const rows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));
  const session = rows[0];
  if (!session) return null;

  const endTime = new Date();
  const durationSeconds = Math.floor(
    (endTime.getTime() - session.startTime.getTime()) / 1000,
  );

  await db
    .update(sessions)
    .set({ endTime, durationSeconds })
    .where(eq(sessions.id, sessionId));

  // Update daily stats
  const dateStart = new Date(session.startTime);
  dateStart.setHours(0, 0, 0, 0);

  await upsertDailyStats(session.goalId, dateStart, durationSeconds);

  return { endTime, durationSeconds };
}

/** Record a completed Pomodoro session with actual work duration. */
export async function recordPomodoroSession(
  goalId: number,
  durationSeconds: number,
  notes?: string,
) {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - durationSeconds * 1000);

  const result = await db
    .insert(sessions)
    .values({ goalId, startTime, endTime, durationSeconds, notes })
    .returning();

  // Update daily stats
  const dateStart = new Date(startTime);
  dateStart.setHours(0, 0, 0, 0);
  await upsertDailyStats(goalId, dateStart, durationSeconds);

  return result[0] ?? null;
}

export async function getActiveSession(goalId?: number) {
  const condition = goalId
    ? and(isNull(sessions.endTime), eq(sessions.goalId, goalId))
    : isNull(sessions.endTime);

  const rows = await db.select().from(sessions).where(condition);
  return rows[0] ?? null;
}

export async function getSessionsByGoal(goalId: number) {
  return db
    .select()
    .from(sessions)
    .where(eq(sessions.goalId, goalId))
    .orderBy(desc(sessions.startTime));
}

export async function getSessionsByDate(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return db
    .select()
    .from(sessions)
    .where(between(sessions.startTime, start, end))
    .orderBy(desc(sessions.startTime));
}

export async function deleteSession(id: number) {
  return db.delete(sessions).where(eq(sessions.id, id));
}

// ─── Daily Stats ─────────────────────────────────────────

export async function upsertDailyStats(
  goalId: number,
  date: Date,
  additionalSeconds: number,
) {
  const existing = await db
    .select()
    .from(dailyStats)
    .where(and(eq(dailyStats.goalId, goalId), eq(dailyStats.date, date)));

  if (existing.length > 0) {
    return db
      .update(dailyStats)
      .set({
        durationSeconds: sql`${dailyStats.durationSeconds} + ${additionalSeconds}`,
        sessionCount: sql`${dailyStats.sessionCount} + 1`,
      })
      .where(eq(dailyStats.id, existing[0].id));
  } else {
    return db.insert(dailyStats).values({
      goalId,
      date,
      durationSeconds: additionalSeconds,
      sessionCount: 1,
    });
  }
}

export async function getDailyStatsForGoal(goalId: number, date: Date) {
  const rows = await db
    .select()
    .from(dailyStats)
    .where(and(eq(dailyStats.goalId, goalId), eq(dailyStats.date, date)));
  return rows[0] ?? null;
}

export async function getStatsForDateRange(
  goalId: number,
  startDate: Date,
  endDate: Date,
) {
  return db
    .select()
    .from(dailyStats)
    .where(
      and(
        eq(dailyStats.goalId, goalId),
        between(dailyStats.date, startDate, endDate),
      ),
    )
    .orderBy(dailyStats.date);
}

export async function getAllStatsForDate(date: Date) {
  return db.select().from(dailyStats).where(eq(dailyStats.date, date));
}

// ─── Streaks ─────────────────────────────────────────────

/** Get current streak for a single habit (consecutive days ending at today) */
export async function getHabitStreak(habitId: number): Promise<number> {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const row = await db
      .select()
      .from(logs)
      .where(and(eq(logs.habit_id, habitId), eq(logs.date, dateStr)));
    if (row.length > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/** Get streaks for all habits at once */
export async function getAllHabitStreaks(): Promise<Record<number, number>> {
  const allHabits = await db.select().from(habits);
  const streaks: Record<number, number> = {};
  for (const h of allHabits) {
    streaks[h.id] = await getHabitStreak(h.id);
  }
  return streaks;
}

/** Get completion counts per day for the last N days (for charts) */
export async function getHabitCompletionHistory(days: number = 7): Promise<{ date: string; completed: number; total: number }[]> {
  const allHabits = await db.select().from(habits);
  const total = allHabits.length;
  const result: { date: string; completed: number; total: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayLogs = await db.select().from(logs).where(eq(logs.date, dateStr));
    result.push({ date: dateStr, completed: dayLogs.length, total });
  }
  return result;
}

/** Get session hours per day for a goal over the last N days (for charts) */
export async function getGoalSessionHistory(goalId: number, days: number = 7): Promise<{ date: string; hours: number }[]> {
  const result: { date: string; hours: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const stat = await getDailyStatsForGoal(goalId, d);
    const dateStr = d.toISOString().split("T")[0];
    result.push({ date: dateStr, hours: stat ? stat.durationSeconds / 3600 : 0 });
  }
  return result;
}

/** Get total session hours per day across all goals over the last N days */
export async function getTotalSessionHistory(days: number = 7): Promise<{ date: string; hours: number }[]> {
  const result: { date: string; hours: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const stats = await getAllStatsForDate(d);
    const totalSec = stats.reduce((sum, s) => sum + s.durationSeconds, 0);
    const dateStr = d.toISOString().split("T")[0];
    result.push({ date: dateStr, hours: totalSec / 3600 });
  }
  return result;
}
