import { FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useHabits } from "@/context/habits-context";
import { DateSelector } from "@/components/DateSelector";
import { View, Text, useColors } from "@/components/Themed";
import Colors from "@/constants/Colors";
import ScreenLayout from "@/components/ScreenLayout";

export default function HabitTrackerScreen() {
  const {
    habitsList,
    dailyHabits,
    selectedDate,
    setSelectedDate,
    toggleHabit,
  } = useHabits();
  const c = useColors();

  return (
    <ScreenLayout fullScreen>
      <View style={styles.container}>
        <DateSelector date={selectedDate} onDateChange={setSelectedDate} />
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
              No habits
            </Text>
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>
              Add some in Settings!
            </Text>
          </View>
        ) : (
          <FlatList
            data={dailyHabits}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.habitItem, { borderBottomColor: c.border }]}
                onPress={() => toggleHabit(item.id)}
                activeOpacity={0.6}
              >
                <View
                  style={[styles.habitLeft, { backgroundColor: "transparent" }]}
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
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
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
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  habitLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  checkWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  habitName: { fontSize: 16, fontWeight: "500" },
});
