import { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { Text, View } from "@/components/Themed";
import { MaterialIcons } from "@expo/vector-icons";
import { useHabits } from "@/context/habits-context";
import { useRouter, type Href } from "expo-router";
import { Habit } from "@/db";

export default function SettingsScreen() {
  const { habitsList, addHabit, removeHabit } = useHabits();
  const [newHabit, setNewHabit] = useState("");
  const router = useRouter();

  const onAddHabit = () => {
    const habit = newHabit.trim();
    if (habit) {
      addHabit(habit);
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
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/habit-tracker" as Href)}
      >
        <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
        <Text style={styles.navText}>Habit Tracker</Text>
        <MaterialIcons name="chevron-right" size={24} color="#999" />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Manage Habits</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newHabit}
          onChangeText={setNewHabit}
          placeholder="Enter new habit"
          returnKeyType="done"
          onSubmitEditing={onAddHabit}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddHabit}
          disabled={!newHabit.trim()}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={habitsList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.habitItem}>
            <Text style={styles.habitName}>{item.name}</Text>
            <TouchableOpacity onPress={() => onRemoveHabit(item)}>
              <MaterialIcons name="delete" size={24} color="#FF5252" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    marginBottom: 8,
  },
  navText: {
    flex: 1,
    fontSize: 16,
    color: "#212121",
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212121",
    marginTop: 16,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 4,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
