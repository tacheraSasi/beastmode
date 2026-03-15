import { FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useHabits } from "@/context/habits-context";
import { DateSelector } from "@/components/DateSelector";
import { View, Text, useColors } from "@/components/Themed";
import Colors from "@/constants/Colors";
import ScreenLayout from "@/components/ScreenLayout";

export default function HabitsTab() {
  const {
    habitsList,
    dailyHabits,
    selectedDate,
    setSelectedDate,
    toggleHabit,
  } = useHabits();
  const c = useColors();

  const completedCount = dailyHabits.filter((h) => h.completed).length;
  const progressPct =
    dailyHabits.length > 0
      ? Math.round((completedCount / dailyHabits.length) * 100)
      : 0;

  return (
    <ScreenLayout insideTabs>
      <View style={styles.container}>
        <Text style={[styles.pageTitle, { color: c.text }]}>Habits</Text>

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
              Add habits in Settings to start tracking
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
                {item.completed && (
                  <MaterialIcons
                    name="check-circle"
                    size={20}
                    color={c.success}
                    style={{ marginLeft: "auto" }}
                  />
                )}
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
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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
  habitName: { fontSize: 16, fontWeight: "500" },
});
