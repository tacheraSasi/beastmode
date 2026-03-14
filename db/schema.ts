import { sql } from "drizzle-orm";
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

export type Habit = typeof habits.$inferSelect;
export type Log = typeof logs.$inferSelect;
