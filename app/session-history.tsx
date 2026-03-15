import { useCallback, useState } from "react";
import { FlatList, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { getGoalById, getSessionsByGoal, deleteSession } from "@/db";
import { View, Text, useColors } from "@/components/Themed";
import Colors from "@/constants/Colors";
import ScreenLayout from "@/components/ScreenLayout";
import type { Goal, Session } from "@/db";

export default function SessionHistoryScreen() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const c = useColors();

  const load = useCallback(async () => {
    if (!goalId) return;
    const g = await getGoalById(Number(goalId));
    setGoal(g);
    setSessions(await getSessionsByGoal(Number(goalId)));
  }, [goalId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleDelete = (session: Session) => {
    Alert.alert("Delete Session", "Remove this session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteSession(session.id);
          load();
        },
      },
    ]);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "In progress";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <ScreenLayout fullScreen>
    <View style={styles.container}>
      {goal && (
        <View style={[styles.header, { backgroundColor: "transparent" }]}>
          <View style={[styles.iconWrap, { backgroundColor: c.surfaceAlt }]}>
            <Text style={styles.icon}>{goal.icon ?? "🎯"}</Text>
          </View>
          <Text style={[styles.goalName, { color: c.text }]}>{goal.name}</Text>
        </View>
      )}

      {sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>
            No sessions yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.sessionCard,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
            >
              <View
                style={[styles.sessionInfo, { backgroundColor: "transparent" }]}
              >
                <Text style={[styles.sessionDate, { color: c.text }]}>
                  {item.startTime.toLocaleDateString()}
                </Text>
                <Text style={[styles.sessionTime, { color: c.textSecondary }]}>
                  {item.startTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {item.endTime
                    ? ` – ${item.endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                    : ""}
                </Text>
                {item.notes ? (
                  <Text style={[styles.notes, { color: c.textMuted }]}>
                    {item.notes}
                  </Text>
                ) : null}
              </View>
              <View
                style={[
                  styles.sessionRight,
                  { backgroundColor: "transparent" },
                ]}
              >
                <View
                  style={[
                    styles.durationBadge,
                    {
                      backgroundColor: item.durationSeconds
                        ? Colors.accentLight
                        : c.surfaceAlt,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.durationText,
                      {
                        color: item.durationSeconds
                          ? Colors.accent
                          : c.textMuted,
                      },
                    ]}
                  >
                    {formatDuration(item.durationSeconds)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{ marginTop: 8 }}
                >
                  <MaterialIcons
                    name="delete-outline"
                    size={20}
                    color={c.danger}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  icon: { fontSize: 20 },
  goalName: { fontSize: 20, fontWeight: "700" },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  emptyText: { fontSize: 16 },
  sessionCard: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sessionInfo: { flex: 1 },
  sessionDate: { fontSize: 15, fontWeight: "600" },
  sessionTime: { fontSize: 13, marginTop: 3 },
  notes: { fontSize: 13, marginTop: 4, fontStyle: "italic" },
  sessionRight: { alignItems: "flex-end", justifyContent: "space-between" },
  durationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: { fontSize: 14, fontWeight: "700" },
});
