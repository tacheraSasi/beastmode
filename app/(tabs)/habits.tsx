import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useHabits } from "@/context/habits-context";
import { useFocusEffect } from "expo-router";
import { DateSelector } from "@/components/DateSelector";
import { View, Text, useColors } from "@/components/Themed";
import { MiniBarChart } from "@/components/Charts";
import Colors from "@/constants/Colors";
import ScreenLayout from "@/components/ScreenLayout";
import { Habit, getHabitCompletionHistory } from "@/db";

export default function HabitsTab() {
  const {
    habitsList,
    dailyHabits,
    streaks,
    selectedDate,
    setSelectedDate,
    toggleHabit,
    addHabit,
    removeHabit,
  } = useHabits();
  const c = useColors();
  const [managing, setManaging] = useState(false);
  const [newHabit, setNewHabit] = useState("");
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const history = await getHabitCompletionHistory(7);
        setChartData(history.map((d) => d.completed));
        setChartLabels(
          history.map((d) => {
            const dt = new Date(d.date + "T00:00:00");
            return dt
              .toLocaleDateString("en", { weekday: "short" })
              .slice(0, 3);
          }),
        );
      })();
    }, [dailyHabits]),
  );

  const longestStreak = Math.max(0, ...Object.values(streaks));

  const completedCount = dailyHabits.filter((h) => h.completed).length;
  const progressPct =
    dailyHabits.length > 0
      ? Math.round((completedCount / dailyHabits.length) * 100)
      : 0;

  const onAddHabit = () => {
    const name = newHabit.trim();
    if (name) {
      addHabit(name);
      setNewHabit("");
    }
  };

  const onRemoveHabit = (habit: Habit) => {
    Alert.alert(
      "Remove Habit",
      `Are you sure you want to remove "${habit.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: () => removeHabit(habit.id),
          style: "destructive",
        },
      ],
    );
  };

  return (
    <ScreenLayout insideTabs>
      <View style={styles.container}>
        <View style={[styles.headerRow, { backgroundColor: "transparent" }]}>
          <Text style={[styles.pageTitle, { color: c.text }]}>Habits</Text>
          <TouchableOpacity
            style={[
              styles.manageBtn,
              {
                backgroundColor: managing ? Colors.accent : c.surfaceAlt,
              },
            ]}
            onPress={() => setManaging((v) => !v)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={managing ? "close" : "edit"}
              size={16}
              color={managing ? "#fff" : c.textSecondary}
            />
            <Text
              style={[
                styles.manageBtnText,
                { color: managing ? "#fff" : c.textSecondary },
              ]}
            >
              {managing ? "Done" : "Manage"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Manage section */}
        {managing && (
          <View
            style={[
              styles.manageCard,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <View style={[styles.inputRow, { backgroundColor: "transparent" }]}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: c.surfaceAlt,
                    borderColor: c.border,
                    color: c.text,
                  },
                ]}
                value={newHabit}
                onChangeText={setNewHabit}
                placeholder="New habit name"
                placeholderTextColor={c.textMuted}
                returnKeyType="done"
                onSubmitEditing={onAddHabit}
              />
              <TouchableOpacity
                style={[
                  styles.addButton,
                  {
                    backgroundColor: Colors.accent,
                    opacity: newHabit.trim() ? 1 : 0.5,
                  },
                ]}
                onPress={onAddHabit}
                disabled={!newHabit.trim()}
                activeOpacity={0.8}
              >
                <MaterialIcons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            {habitsList.map((item, i) => (
              <View
                key={item.id}
                style={[
                  styles.manageItem,
                  {
                    borderBottomColor: c.border,
                    backgroundColor: "transparent",
                    borderBottomWidth: i < habitsList.length - 1 ? 1 : 0,
                  },
                ]}
              >
                <View
                  style={[
                    styles.manageItemDot,
                    { backgroundColor: Colors.accent },
                  ]}
                />
                <Text style={[styles.manageItemName, { color: c.text }]}>
                  {item.name}
                </Text>
                <TouchableOpacity
                  onPress={() => onRemoveHabit(item)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialIcons
                    name="delete-outline"
                    size={20}
                    color={c.danger}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <DateSelector date={selectedDate} onDateChange={setSelectedDate} />

        {/* Progress summary */}
        {dailyHabits.length > 0 && (
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <View
              style={[styles.summaryRow, { backgroundColor: "transparent" }]}
            >
              <View style={{ backgroundColor: "transparent", flex: 1 }}>
                <Text style={[styles.summaryLabel, { color: c.textSecondary }]}>
                  Today's Progress
                </Text>
                <Text style={[styles.summaryValue, { color: c.text }]}>
                  {completedCount} of {dailyHabits.length} done
                </Text>
              </View>
              <View
                style={[
                  styles.summaryBadge,
                  {
                    backgroundColor:
                      progressPct === 100 ? c.successLight : Colors.accentLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.summaryBadgeText,
                    {
                      color: progressPct === 100 ? c.success : Colors.accent,
                    },
                  ]}
                >
                  {progressPct}%
                </Text>
              </View>
            </View>
            <View
              style={[styles.progressBarBg, { backgroundColor: c.surfaceAlt }]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progressPct}%`,
                    backgroundColor:
                      progressPct === 100 ? c.success : Colors.accent,
                  },
                ]}
              />
            </View>
            {/* Streak row */}
            <View
              style={[styles.streakRow, { backgroundColor: "transparent" }]}
            >
              <MaterialIcons
                name="local-fire-department"
                size={16}
                color={Colors.accent}
              />
              <Text style={[styles.streakRowText, { color: c.textSecondary }]}>
                Best streak: {longestStreak} day{longestStreak !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        )}

        {/* Weekly completion chart */}
        {chartData.length > 0 && habitsList.length > 0 && (
          <View
            style={[
              styles.chartCard,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <Text style={[styles.chartTitle, { color: c.text }]}>
              This Week
            </Text>
            <MiniBarChart data={chartData} labels={chartLabels} height={160} />
          </View>
        )}

        {habitsList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View
              style={[styles.emptyIconWrap, { backgroundColor: c.surfaceAlt }]}
            >
              <MaterialIcons
                name="check-circle-outline"
                size={40}
                color={c.textMuted}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: c.text }]}>
              No habits yet
            </Text>
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>
              Tap "Manage" to add your first habit
            </Text>
          </View>
        ) : (
          <FlatList
            data={dailyHabits}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 4, paddingBottom: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.habitItem,
                  { backgroundColor: c.card, borderColor: c.border },
                ]}
                onPress={() => toggleHabit(item.id)}
                activeOpacity={0.6}
              >
                <View
                  style={[
                    styles.checkWrap,
                    {
                      backgroundColor: item.completed
                        ? Colors.accent
                        : "transparent",
                      borderColor: item.completed ? Colors.accent : c.border,
                    },
                  ]}
                >
                  {item.completed && (
                    <MaterialIcons name="check" size={16} color="#fff" />
                  )}
                </View>
                <Text
                  style={[
                    styles.habitName,
                    {
                      color: item.completed ? c.textMuted : c.text,
                      textDecorationLine: item.completed
                        ? "line-through"
                        : "none",
                    },
                  ]}
                >
                  {item.name}
                </Text>
                <View
                  style={[
                    styles.habitRight,
                    { backgroundColor: "transparent" },
                  ]}
                >
                  {(streaks[item.id] ?? 0) > 0 && (
                    <View
                      style={[
                        styles.streakBadge,
                        { backgroundColor: Colors.accentLight },
                      ]}
                    >
                      <MaterialIcons
                        name="local-fire-department"
                        size={12}
                        color={Colors.accent}
                      />
                      <Text
                        style={[
                          styles.streakBadgeText,
                          { color: Colors.accent },
                        ]}
                      >
                        {streaks[item.id]}
                      </Text>
                    </View>
                  )}
                  {item.completed && (
                    <MaterialIcons
                      name="check-circle"
                      size={20}
                      color={c.success}
                    />
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  manageBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
  },
  manageBtnText: { fontSize: 13, fontWeight: "600" },
  manageCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  inputRow: { flexDirection: "row", marginBottom: 8, gap: 8 },
  input: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  manageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  manageItemDot: { width: 7, height: 7, borderRadius: 4, marginRight: 10 },
  manageItemName: { fontSize: 15, fontWeight: "500", flex: 1 },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: { fontSize: 13, fontWeight: "600" },
  summaryValue: { fontSize: 18, fontWeight: "700", marginTop: 2 },
  summaryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  summaryBadgeText: { fontSize: 15, fontWeight: "700" },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: { height: 6, borderRadius: 3 },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
    backgroundColor: "transparent",
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", marginBottom: 6 },
  emptyText: { textAlign: "center", fontSize: 15 },
  habitItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  checkWrap: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  habitName: { fontSize: 16, fontWeight: "500", flex: 1 },
  habitRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: "auto",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 2,
  },
  streakBadgeText: { fontSize: 12, fontWeight: "700" },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 4,
  },
  streakRowText: { fontSize: 13, fontWeight: "600" },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  chartTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
});
