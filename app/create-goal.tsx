import { useState } from "react";
import {
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { createGoal } from "@/db";
import { View, Text, useColors } from "@/components/Themed";
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
];

export default function CreateGoalScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [goalHours, setGoalHours] = useState("100");
  const c = useColors();

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await createGoal({
      name: trimmed,
      icon,
      goalHours: Number(goalHours) || 100,
    });
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
          autoFocus
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

        <TouchableOpacity
          style={[
            styles.createBtn,
            { backgroundColor: Colors.accent, opacity: name.trim() ? 1 : 0.5 },
          ]}
          onPress={handleCreate}
          disabled={!name.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.createBtnText}>Create Goal</Text>
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
  createBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 36,
    marginBottom: 40,
    shadowColor: "#E73B37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  createBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
