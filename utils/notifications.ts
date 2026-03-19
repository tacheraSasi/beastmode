import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Set up a dedicated Android channel for active session (ongoing, no sound)
if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("active-session", {
    name: "Active Session",
    importance: Notifications.AndroidImportance.LOW,
    sound: undefined,
    vibrationPattern: [100],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

/** Request permission for notifications. Returns true if granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/** Schedule a daily habit reminder at a given hour (24h format). */
export async function scheduleDailyHabitReminder(hour: number = 9, minute: number = 0) {
  // Cancel existing habit reminders first
  await cancelHabitReminders();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔥 Time to check your habits!",
      body: "Don't break your streak log your habits for today.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

/** Schedule a daily session reminder at a given hour. */
export async function scheduleDailySessionReminder(hour: number = 18, minute: number = 0) {
  // Cancel existing session reminders first
  await cancelSessionReminders();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "💪 Ready for a session?",
      body: "Put in the work start a focus session now.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

/** Schedule a daily goal-specific reminder at a given hour. */
export async function scheduleDailyGoalSpecificReminder(title: string, body: string, hour: number = 18, minute: number = 0) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

/** Schedule or update a daily reminder for a specific goal. */
export async function scheduleGoalReminder(goalId: number, goalName: string, goalIcon: string, hour: number, minute: number) {
  // Cancel existing reminder for this goal first
  await cancelGoalReminder(goalId);

  const granted = await requestNotificationPermission();
  if (!granted) return false;

  await Notifications.scheduleNotificationAsync({
    identifier: `goal-reminder-${goalId}`,
    content: {
      title: `${goalIcon} Time for ${goalName}!`,
      body: "Stay consistent — put in the work today.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  return true;
}

/** Cancel the daily reminder for a specific goal. */
export async function cancelGoalReminder(goalId: number) {
  try {
    await Notifications.cancelScheduledNotificationAsync(`goal-reminder-${goalId}`);
  } catch {
    // Notification may not exist yet, ignore
  }
}

/** Cancel all habit-related scheduled notifications. */
export async function cancelHabitReminders() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of all) {
    if (n.content.title?.includes("habits")) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}

/** Cancel all session-related scheduled notifications. */
export async function cancelSessionReminders() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of all) {
    if (n.content.title?.includes("session")) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}

/** Cancel all scheduled notifications. */
export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/** Check if any reminders are currently scheduled. */
export async function hasScheduledReminders(): Promise<{ habits: boolean; sessions: boolean }> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return {
    habits: all.some((n) => n.content.title?.includes("habits")),
    sessions: all.some((n) => n.content.title?.includes("session")),
  };
}

// ─── Active Session Notification ─────────────────────────

const ACTIVE_SESSION_ID = "active-session-timer";

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/** Show a persistent notification for an active session (non-dismissible on Android). */
export async function showActiveSessionNotification(goalName: string, goalIcon: string, elapsedSeconds: number) {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  await Notifications.scheduleNotificationAsync({
    identifier: ACTIVE_SESSION_ID,
    content: {
      title: `${goalIcon} ${goalName} — Session Active`,
      body: `⏱ ${formatElapsed(elapsedSeconds)} elapsed — keep going!`,
      sound: false,
      sticky: true,
      autoDismiss: false,
      ...(Platform.OS === "android" && {
        channelId: "active-session",
      }),
    },
    trigger: null,
  });
}

/** Update the active session notification with the current elapsed time. */
export async function updateActiveSessionNotification(goalName: string, goalIcon: string, elapsedSeconds: number) {
  // Re-scheduling with the same identifier replaces the existing notification
  await Notifications.scheduleNotificationAsync({
    identifier: ACTIVE_SESSION_ID,
    content: {
      title: `${goalIcon} ${goalName} — Session Active`,
      body: `⏱ ${formatElapsed(elapsedSeconds)} elapsed — keep going!`,
      sound: false,
      sticky: true,
      autoDismiss: false,
      ...(Platform.OS === "android" && {
        channelId: "active-session",
      }),
    },
    trigger: null,
  });
}

/** Dismiss the active session notification. */
export async function dismissActiveSessionNotification() {
  await Notifications.dismissNotificationAsync(ACTIVE_SESSION_ID);
}
