import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getGoalById, updateGoal } from "@/db";

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
];

export default function EditGoalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [goalHours, setGoalHours] = useState("100");

  useEffect(() => {
    if (!id) return;
    (async () => {
      const goal = await getGoalById(Number(id));
      if (goal) {
        setName(goal.name);
        setIcon(goal.icon ?? "🎯");
        setGoalHours(String(goal.goalHours ?? 100));
      }
    })();
  }, [id]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed || !id) return;
    await updateGoal(Number(id), {
      name: trimmed,
      icon,
      goalHours: Number(goalHours) || 100,
    });
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Goal Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Learn Guitar"
      />

      <Text style={styles.label}>Icon</Text>
      <View style={styles.iconRow}>
        {ICON_OPTIONS.map((ic) => (
          <TouchableOpacity
            key={ic}
            style={[styles.iconBtn, icon === ic && styles.iconBtnSelected]}
            onPress={() => setIcon(ic)}
          >
            <Text style={styles.iconText}>{ic}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Target Hours</Text>
      <TextInput
        style={styles.input}
        value={goalHours}
        onChangeText={setGoalHours}
        keyboardType="numeric"
        placeholder="100"
      />

      <TouchableOpacity
        style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={!name.trim()}
      >
        <Text style={styles.saveBtnText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#757575",
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  iconRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnSelected: {
    backgroundColor: "#E3F2FD",
    borderWidth: 2,
    borderColor: "#2196F3",
  },
  iconText: { fontSize: 24 },
  saveBtn: {
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 40,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
