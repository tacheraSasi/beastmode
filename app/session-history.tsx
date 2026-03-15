import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { getGoalById, getSessionsByGoal, deleteSession } from "@/db";
import type { Goal, Session } from "@/db";

export default function SessionHistoryScreen() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);

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
    <View style={styles.container}>
      {goal && (
        <View style={styles.header}>
          <Text style={styles.icon}>{goal.icon ?? "🎯"}</Text>
          <Text style={styles.goalName}>{goal.name}</Text>
        </View>
      )}

      {sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No sessions yet.</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.sessionCard}>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionDate}>
                  {item.startTime.toLocaleDateString()}
                </Text>
                <Text style={styles.sessionTime}>
                  {item.startTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {item.endTime
                    ? ` – ${item.endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                    : ""}
                </Text>
                {item.notes ? (
                  <Text style={styles.notes}>{item.notes}</Text>
                ) : null}
              </View>
              <View style={styles.sessionRight}>
                <Text style={styles.duration}>
                  {formatDuration(item.durationSeconds)}
                </Text>
                <TouchableOpacity onPress={() => handleDelete(item)}>
                  <MaterialIcons name="delete-outline" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: { fontSize: 28, marginRight: 8 },
  goalName: { fontSize: 20, fontWeight: "bold", color: "#212121" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 16, color: "#999" },
  sessionCard: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  sessionInfo: { flex: 1 },
  sessionDate: { fontSize: 15, fontWeight: "600", color: "#212121" },
  sessionTime: { fontSize: 13, color: "#757575", marginTop: 2 },
  notes: { fontSize: 13, color: "#999", marginTop: 4 },
  sessionRight: { alignItems: "flex-end", justifyContent: "space-between" },
  duration: { fontSize: 16, fontWeight: "bold", color: "#212121" },
});
