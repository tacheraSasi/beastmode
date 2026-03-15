import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { db, expo_sqlite } from "@/db";
import migrations from "@/drizzle/migrations";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { HabitsProvider } from "@/context/habits-context";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const { success, error: migrationError } = useMigrations(db, migrations);

  useDrizzleStudio(expo_sqlite);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
    if (migrationError) throw migrationError;
  }, [error, migrationError]);

  useEffect(() => {
    if (loaded && success) {
      SplashScreen.hideAsync();
    }
  }, [loaded, success]);

  if (!loaded && !success) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <HabitsProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="goal-details"
            options={{ title: "Goal Details" }}
          />
          <Stack.Screen name="start-session" options={{ title: "Session" }} />
          <Stack.Screen
            name="session-history"
            options={{ title: "Session History" }}
          />
          <Stack.Screen
            name="habit-tracker"
            options={{ title: "Habit Tracker" }}
          />
          <Stack.Screen
            name="create-goal"
            options={{ title: "Create Goal", presentation: "modal" }}
          />
          <Stack.Screen
            name="edit-goal"
            options={{ title: "Edit Goal", presentation: "modal" }}
          />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
      </HabitsProvider>
    </ThemeProvider>
  );
}
