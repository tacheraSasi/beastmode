import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const habits = sqliteTable("habits", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
});

export const logs = sqliteTable("logs", {
  id: integer().primaryKey({ autoIncrement: true }),
  date: text().default(sql`(CURRENT_DATE)`),
  habit_id: integer().references(() => habits.id),
});

export const goals = sqliteTable("goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  name: text("name").notNull(),

  icon: text("icon"),

  goalHours: integer("goal_hours").default(100),

  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),

  updatedAt: integer("updated_at", { mode: "timestamp" })
});

export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  goalId: integer("goal_id")
    .notNull()
    .references(() => goals.id),

  startTime: integer("start_time", { mode: "timestamp" }).notNull(),

  endTime: integer("end_time", { mode: "timestamp" }),

  durationSeconds: integer("duration_seconds"),

  notes: text("notes"),

  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
});



export const goalRelations = relations(goals, ({ many }) => ({
  sessions: many(sessions)
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  goal: one(goals, {
    fields: [sessions.goalId],
    references: [goals.id]
  })
}));

export type Goal = typeof goals.$inferSelect;
export type Session = typeof sessions.$inferSelect;


export type Habit = typeof habits.$inferSelect;
export type Log = typeof logs.$inferSelect;
