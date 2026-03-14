import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useHabits } from "@/context/habits-context";
import { DateSelector } from "@/components/DateSelector";

export default function IndexScreen() {
  const { habitsList, dailyHabits, selectedDate, setSelectedDate, toggleHabit } = useHabits();

  return (
    <View style={styles.container}>
      <DateSelector date={selectedDate} onDateChange={setSelectedDate} />
      {habitsList.length === 0 ? (
        <Text style={styles.emptyText}>No habits yet. Add some in the Settings tab!</Text>
      ) : (
        <FlatList
          data={dailyHabits}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.habitItem} onPress={() => toggleHabit(item.id)}>
              <Text style={styles.habitName}>{item.name}</Text>
              <MaterialIcons
                name={item.completed ? "check-circle" : "radio-button-unchecked"}
                size={24}
                color={item.completed ? "#4CAF50" : "#757575"}
              />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#757575",
  },
  habitItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  habitName: {
    fontSize: 16,
    color: "#212121",
  },
});
