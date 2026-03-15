import { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { Text, View, useColors } from "@/components/Themed";
import { MaterialIcons } from "@expo/vector-icons";
import { useHabits } from "@/context/habits-context";
import { useRouter, type Href } from "expo-router";
import Colors from "@/constants/Colors";
import { Habit } from "@/db";

export default function SettingsScreen() {
  const { habitsList, addHabit, removeHabit } = useHabits();
  const [newHabit, setNewHabit] = useState("");
  const router = useRouter();
  const c = useColors();

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
      <Text style={[styles.pageTitle, { color: c.text }]}>Settings</Text>

      <TouchableOpacity
        style={[styles.navCard, { backgroundColor: c.card, borderColor: c.border }]}
        onPress={() => router.push("/habit-tracker" as Href)}
        activeOpacity={0.7}
      >
        <View style={[styles.navIconWrap, { backgroundColor: c.successLight }]}>
          <MaterialIcons name="check-circle" size={22} color={c.success} />
        </View>
        <View style={[styles.navContent, { backgroundColor: "transparent" }]}>
          <Text style={[styles.navText, { color: c.text }]}>Habit Tracker</Text>
          <Text style={[styles.navSub, { color: c.textSecondary }]}>
            Track your daily habits
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={c.textMuted} />
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: c.text }]}>Manage Habits</Text>

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
          placeholder="Enter new habit"
          placeholderTextColor={c.textMuted}
          returnKeyType="done"
          onSubmitEditing={onAddHabit}
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: Colors.accent, opacity: newHabit.trim() ? 1 : 0.5 },
          ]}
          onPress={onAddHabit}
          disabled={!newHabit.trim()}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={habitsList}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View
            style={[styles.habitItem, { borderBottomColor: c.border, backgroundColor: "transparent" }]}
          >
            <View style={[styles.habitLeft, { backgroundColor: "transparent" }]}>
              <View style={[styles.habitDot, { backgroundColor: Colors.accent }]} />
              <Text style={[styles.habitName, { color: c.text }]}>
                {item.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => onRemoveHabit(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="delete-outline" size={22} color={c.danger} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  pageTitle: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5, marginBottom: 20 },
  navCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  navIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  navContent: { flex: 1 },
  navText: { fontSize: 16, fontWeight: "700" },
  navSub: { fontSize: 13, marginTop: 2 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 14 },
  inputRow: { flexDirection: "row", marginBottom: 16, gap: 10 },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  habitItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  habitLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  habitDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  habitName: { fontSize: 16, fontWeight: "500" },
})
