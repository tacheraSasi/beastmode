import { useEffect, useRef, useState } from "react";
import {
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Animated,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getGoalById, updateGoal } from "@/db";
import { View, Text, useColors } from "@/components/Themed";
import { MaterialIcons } from "@expo/vector-icons";
import {
  scheduleGoalReminder,
  cancelGoalReminder,
} from "@/utils/notifications";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/Colors";
import ScreenLayout from "@/components/ScreenLayout";

const ICON_OPTIONS = [
  "🎯",
  "💪",
  "📚",
  "🎵",
  "💻",
  "🎨",
  "🏃",
  "🧘",
  "✍️",
  "🔬",
  "🎸",
  "🏀",
  "⚽",
  "🎹",
  "📐",
  "🧑‍💻",
  "📷",
  "🏋️",
  "🚴",
  "🎤",
  "🧠",
  "🗣️",
  "📖",
  "🎮",
  "🏊",
  "🥋",
  "🎻",
  "⛹️",
  "🧑‍🍳",
  "🌍",
];

export default function EditGoalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [goalHours, setGoalHours] = useState("100");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(18);
  const [reminderMinute, setReminderMinute] = useState(0);
  const reminderAnim = useRef(new Animated.Value(0)).current;
  const c = useColors();

  const toggleReminder = (value: boolean) => {
    setReminderEnabled(value);
    Animated.timing(reminderAnim, {
      toValue: value ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      const goal = await getGoalById(Number(id));
      if (goal) {
        setName(goal.name);
        setIcon(goal.icon ?? "🎯");
        setGoalHours(String(goal.goalHours ?? 100));
        if (goal.reminderHour != null && goal.reminderMinute != null) {
          setReminderEnabled(true);
          setReminderHour(goal.reminderHour);
          setReminderMinute(goal.reminderMinute);
          reminderAnim.setValue(1);
        }
      }
    })();
  }, [id]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed || !id) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const goalId = Number(id);

    await updateGoal(goalId, {
      name: trimmed,
      icon,
      goalHours: Number(goalHours) || 100,
      reminderHour: reminderEnabled ? reminderHour : null,
      reminderMinute: reminderEnabled ? reminderMinute : null,
    });

    if (reminderEnabled) {
      const ok = await scheduleGoalReminder(
        goalId,
        trimmed,
        icon,
        reminderHour,
        reminderMinute,
      );
      if (!ok) {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings to use reminders.",
        );
      }
    } else {
      await cancelGoalReminder(goalId);
    }

    router.back();
  };

  return (
    <ScreenLayout fullScreen keyboardAware>
      <ScrollView
        style={[styles.container, { backgroundColor: c.background }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.label, { color: c.textSecondary }]}>
          Goal Name
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: c.surfaceAlt,
              borderColor: c.border,
              color: c.text,
            },
          ]}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Learn Guitar"
          placeholderTextColor={c.textMuted}
        />

        <Text style={[styles.label, { color: c.textSecondary }]}>
          Target Hours
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: c.surfaceAlt,
              borderColor: c.border,
              color: c.text,
            },
          ]}
          value={goalHours}
          onChangeText={setGoalHours}
          keyboardType="numeric"
          placeholder="100"
          placeholderTextColor={c.textMuted}
        />

        <Text style={[styles.label, { color: c.textSecondary }]}>Icon</Text>
        <View style={[styles.iconRow, { backgroundColor: "transparent" }]}>
          {ICON_OPTIONS.map((ic) => (
            <TouchableOpacity
              key={ic}
              style={[
                styles.iconBtn,
                { backgroundColor: c.surfaceAlt },
                icon === ic && styles.iconBtnSelected,
              ]}
              onPress={() => setIcon(ic)}
              activeOpacity={0.7}
            >
              <Text style={styles.iconText}>{ic}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily Reminder */}
        <Text style={[styles.label, { color: c.textSecondary }]}>
          Daily Reminder
        </Text>
        <View
          style={[
            styles.reminderCard,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <View
            style={[
              styles.reminderToggleRow,
              { backgroundColor: "transparent" },
            ]}
          >
            <MaterialIcons
              name="notifications-active"
              size={20}
              color={reminderEnabled ? Colors.accent : c.textMuted}
            />
            <View
              style={[styles.reminderInfo, { backgroundColor: "transparent" }]}
            >
              <Text style={[styles.reminderLabel, { color: c.text }]}>
                Set a daily reminder
              </Text>
              <Text style={[styles.reminderSub, { color: c.textMuted }]}>
                Get notified to work on this goal
              </Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={toggleReminder}
              trackColor={{ false: c.border, true: Colors.accentLight }}
              thumbColor={reminderEnabled ? Colors.accent : c.textMuted}
            />
          </View>
          <Animated.View
            style={{
              maxHeight: reminderAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 200],
              }),
              opacity: reminderAnim,
              overflow: "hidden",
            }}
          >
            <View
              style={[styles.timePickerDivider, { backgroundColor: c.border }]}
            />
            <View
              style={[styles.timePickerRow, { backgroundColor: "transparent" }]}
            >
              <MaterialIcons name="schedule" size={18} color={c.textMuted} />
              <Text
                style={[styles.timePickerLabel, { color: c.textSecondary }]}
              >
                Reminder time
              </Text>
            </View>
            <View
              style={[
                styles.timePickerWrap,
                { backgroundColor: "transparent" },
              ]}
            >
              {/* Hour Picker */}
              <View
                style={[styles.timeColumn, { backgroundColor: "transparent" }]}
              >
                <TouchableOpacity
                  onPress={() => setReminderHour((h) => (h + 1) % 24)}
                  style={[styles.timeArrow, { backgroundColor: c.surfaceAlt }]}
                  activeOpacity={0.6}
                >
                  <MaterialIcons
                    name="keyboard-arrow-up"
                    size={22}
                    color={c.text}
                  />
                </TouchableOpacity>
                <View
                  style={[
                    styles.timeDisplay,
                    {
                      backgroundColor: c.surfaceAlt,
                      borderColor: Colors.accent,
                    },
                  ]}
                >
                  <Text style={[styles.timeValue, { color: c.text }]}>
                    {String(reminderHour).padStart(2, "0")}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setReminderHour((h) => (h - 1 + 24) % 24)}
                  style={[styles.timeArrow, { backgroundColor: c.surfaceAlt }]}
                  activeOpacity={0.6}
                >
                  <MaterialIcons
                    name="keyboard-arrow-down"
                    size={22}
                    color={c.text}
                  />
                </TouchableOpacity>
                <Text style={[styles.timeUnit, { color: c.textMuted }]}>
                  hour
                </Text>
              </View>

              <Text style={[styles.timeSeparator, { color: c.text }]}>:</Text>

              {/* Minute Picker */}
              <View
                style={[styles.timeColumn, { backgroundColor: "transparent" }]}
              >
                <TouchableOpacity
                  onPress={() => setReminderMinute((m) => (m + 5) % 60)}
                  style={[styles.timeArrow, { backgroundColor: c.surfaceAlt }]}
                  activeOpacity={0.6}
                >
                  <MaterialIcons
                    name="keyboard-arrow-up"
                    size={22}
                    color={c.text}
                  />
                </TouchableOpacity>
                <View
                  style={[
                    styles.timeDisplay,
                    {
                      backgroundColor: c.surfaceAlt,
                      borderColor: Colors.accent,
                    },
                  ]}
                >
                  <Text style={[styles.timeValue, { color: c.text }]}>
                    {String(reminderMinute).padStart(2, "0")}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setReminderMinute((m) => (m - 5 + 60) % 60)}
                  style={[styles.timeArrow, { backgroundColor: c.surfaceAlt }]}
                  activeOpacity={0.6}
                >
                  <MaterialIcons
                    name="keyboard-arrow-down"
                    size={22}
                    color={c.text}
                  />
                </TouchableOpacity>
                <Text style={[styles.timeUnit, { color: c.textMuted }]}>
                  min
                </Text>
              </View>

              {/* AM/PM indicator */}
              <View
                style={[styles.ampmWrap, { backgroundColor: "transparent" }]}
              >
                <View
                  style={[
                    styles.ampmBadge,
                    {
                      backgroundColor:
                        reminderHour < 12 ? Colors.accent : c.surfaceAlt,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.ampmText,
                      { color: reminderHour < 12 ? "#fff" : c.textMuted },
                    ]}
                  >
                    AM
                  </Text>
                </View>
                <View
                  style={[
                    styles.ampmBadge,
                    {
                      backgroundColor:
                        reminderHour >= 12 ? Colors.accent : c.surfaceAlt,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.ampmText,
                      { color: reminderHour >= 12 ? "#fff" : c.textMuted },
                    ]}
                  >
                    PM
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>

        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: Colors.accent, opacity: name.trim() ? 1 : 0.5 },
          ]}
          onPress={handleSave}
          disabled={!name.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
  },
  iconRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  iconBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnSelected: {
    backgroundColor: Colors.accentLight,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  iconText: { fontSize: 24 },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 36,
    marginBottom: 40,
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  reminderCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 4,
  },
  reminderToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  reminderInfo: { flex: 1, marginLeft: 12 },
  reminderLabel: { fontSize: 15, fontWeight: "600" },
  reminderSub: { fontSize: 12, marginTop: 2 },
  timePickerDivider: { height: 1 },
  timePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 6,
  },
  timePickerLabel: { fontSize: 13, fontWeight: "600" },
  timePickerWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  timeColumn: { alignItems: "center", gap: 4 },
  timeArrow: {
    width: 40,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  timeDisplay: {
    width: 64,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  timeValue: { fontSize: 28, fontWeight: "800", letterSpacing: 1 },
  timeUnit: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  timeSeparator: { fontSize: 28, fontWeight: "800", marginBottom: 24 },
  ampmWrap: { marginLeft: 8, gap: 6, marginBottom: 20 },
  ampmBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  ampmText: { fontSize: 13, fontWeight: "700" },
});
