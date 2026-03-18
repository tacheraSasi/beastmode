import * as Notifications from "expo-notifications";

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
