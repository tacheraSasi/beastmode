import { useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Switch,
  Linking,
  ScrollView,
  Alert,
} from "react-native";

import { Text, View, useColors } from "@/components/Themed";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeMode } from "@/context/theme-context";
import Colors from "@/constants/Colors";
import ScreenLayout from "@/components/ScreenLayout";
import {
  requestNotificationPermission,
  scheduleDailyHabitReminder,
  scheduleDailySessionReminder,
  cancelHabitReminders,
  cancelSessionReminders,
  hasScheduledReminders,
} from "@/utils/notifications";

type ThemeOption = "system" | "light" | "dark";

export default function SettingsScreen() {
  const { mode, setMode } = useThemeMode();
  const c = useColors();
  const [habitReminders, setHabitReminders] = useState(false);
  const [sessionReminders, setSessionReminders] = useState(false);

  useEffect(() => {
    hasScheduledReminders().then((r) => {
      setHabitReminders(r.habits);
      setSessionReminders(r.sessions);
    });
  }, []);

  const toggleHabitReminders = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings.",
        );
        return;
      }
      await scheduleDailyHabitReminder(9, 0);
    } else {
      await cancelHabitReminders();
    }
    setHabitReminders(value);
  };

  const toggleSessionReminders = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings.",
        );
        return;
      }
      await scheduleDailySessionReminder(18, 0);
    } else {
      await cancelSessionReminders();
    }
    setSessionReminders(value);
  };

  const themeOptions: {
    value: ThemeOption;
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
  }[] = [
    { value: "system", label: "System", icon: "smartphone" },
    { value: "light", label: "Light", icon: "light-mode" },
    { value: "dark", label: "Dark", icon: "dark-mode" },
  ];

  return (
    <ScreenLayout insideTabs>
      <ScrollView
        style={[styles.container, { backgroundColor: c.background }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageTitle, { color: c.text }]}>Settings</Text>

        {/* Appearance */}
        <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
          APPEARANCE
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          {themeOptions.map((opt, i) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.themeRow,
                i < themeOptions.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: c.border,
                },
              ]}
              onPress={() => setMode(opt.value)}
              activeOpacity={0.6}
            >
              <MaterialIcons
                name={opt.icon}
                size={20}
                color={mode === opt.value ? Colors.accent : c.textMuted}
              />
              <Text
                style={[
                  styles.themeLabel,
                  {
                    color: mode === opt.value ? c.text : c.textSecondary,
                    fontWeight: mode === opt.value ? "700" : "500",
                  },
                ]}
              >
                {opt.label}
              </Text>
              {mode === opt.value && (
                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color={Colors.accent}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications */}
        <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
          NOTIFICATIONS
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <View
            style={[
              styles.notifRow,
              { borderBottomWidth: 1, borderBottomColor: c.border },
            ]}
          >
            <MaterialIcons
              name="notifications-active"
              size={20}
              color={habitReminders ? Colors.accent : c.textMuted}
            />
            <View
              style={[styles.notifInfo, { backgroundColor: "transparent" }]}
            >
              <Text style={[styles.notifLabel, { color: c.text }]}>
                Habit Reminders
              </Text>
              <Text style={[styles.notifSub, { color: c.textMuted }]}>
                Daily at 9:00 AM
              </Text>
            </View>
            <Switch
              value={habitReminders}
              onValueChange={toggleHabitReminders}
              trackColor={{ false: c.border, true: Colors.accentLight }}
              thumbColor={habitReminders ? Colors.accent : c.textMuted}
            />
          </View>
          <View style={styles.notifRow}>
            <MaterialIcons
              name="timer"
              size={20}
              color={sessionReminders ? Colors.accent : c.textMuted}
            />
            <View
              style={[styles.notifInfo, { backgroundColor: "transparent" }]}
            >
              <Text style={[styles.notifLabel, { color: c.text }]}>
                Session Reminders
              </Text>
              <Text style={[styles.notifSub, { color: c.textMuted }]}>
                Daily at 6:00 PM
              </Text>
            </View>
            <Switch
              value={sessionReminders}
              onValueChange={toggleSessionReminders}
              trackColor={{ false: c.border, true: Colors.accentLight }}
              thumbColor={sessionReminders ? Colors.accent : c.textMuted}
            />
          </View>
        </View>

        {/* About */}
        <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
          ABOUT
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <View
            style={[
              styles.aboutRow,
              { borderBottomWidth: 1, borderBottomColor: c.border },
            ]}
          >
            <Text style={[styles.aboutLabel, { color: c.textSecondary }]}>
              App
            </Text>
            <Text style={[styles.aboutValue, { color: c.text }]}>
              Beastmode
            </Text>
          </View>
          <View
            style={[
              styles.aboutRow,
              { borderBottomWidth: 1, borderBottomColor: c.border },
            ]}
          >
            <Text style={[styles.aboutLabel, { color: c.textSecondary }]}>
              Version
            </Text>
            <Text style={[styles.aboutValue, { color: c.text }]}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: c.textSecondary }]}>
              Developer
            </Text>
            <Text style={[styles.aboutValue, { color: c.text }]}>
              tacheraSasi
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.ghButton}
          onPress={() =>
            Linking.openURL("https://github.com/tacheraSasi/beastmode")
          }
          activeOpacity={0.7}
        >
          <MaterialIcons name="code" size={18} color={Colors.accent} />
          <Text style={[styles.ghText, { color: Colors.accent }]}>
            View on GitHub
          </Text>
        </TouchableOpacity>

        <Text style={[styles.footer, { color: c.textMuted }]}>
          Built with Expo & React Native
        </Text>

        <View style={{ height: 30, backgroundColor: "transparent" }} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  themeLabel: { flex: 1, fontSize: 15, marginLeft: 12 },
  notifRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  notifInfo: { flex: 1, marginLeft: 12 },
  notifLabel: { fontSize: 15, fontWeight: "600" },
  notifSub: { fontSize: 12, marginTop: 2 },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  aboutLabel: { fontSize: 14 },
  aboutValue: { fontSize: 14, fontWeight: "600" },
  ghButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 4,
  },
  ghText: { fontSize: 14, fontWeight: "600", marginLeft: 6 },
  footer: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 8,
  },
});
