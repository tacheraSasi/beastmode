import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

export const DATABASE_NAME = "database.db";

export const expo_sqlite = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });
export const db = drizzle(expo_sqlite, { schema });
