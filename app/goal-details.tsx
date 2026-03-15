import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import {
  getGoalById,
  getGoalProgress,
  getSessionsByGoal,
  deleteGoal,
  getActiveSession,
} from "@/db";
import type { Goal, Session } from "@/db";

export default function GoalDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [progress, setProgress] = useState({ totalHours: 0, totalSeconds: 0 });
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      const goalId = Number(id);
      (async () => {
        const g = await getGoalById(goalId);
        if (!g) return;
        setGoal(g);
        setProgress(await getGoalProgress(goalId));
        const sessions = await getSessionsByGoal(goalId);
        setRecentSessions(sessions.slice(0, 5));
        setActiveSession(await getActiveSession(goalId));
      })();
    }, [id]),
  );

  const handleDelete = () => {
    Alert.alert(
      "Delete Goal",
      `Are you sure you want to delete "${goal?.name}"? All sessions and stats will be removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteGoal(Number(id));
            router.back();
          },
        },
      ],
    );
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  if (!goal) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const percentage = Math.min(
    100,
    Math.round((progress.totalHours / (goal.goalHours ?? 100)) * 100),
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.icon}>{goal.icon ?? "🎯"}</Text>
        <Text style={styles.name}>{goal.name}</Text>
        <Text style={styles.hours}>
          {progress.totalHours.toFixed(1)} / {goal.goalHours ?? 100} hours
        </Text>
        <View style={styles.progressBarBg}>
          <View
            style={[styles.progressBarFill, { width: `${percentage}%` }]}
          />
        </View>
        <Text style={styles.percentText}>{percentage}% complete</Text>
      </View>

      <View style={styles.actions}>
        {activeSession ? (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#F44336" }]}
            onPress={() =>
              router.push({
                pathname: "/start-session",
                params: { goalId: goal.id },
              })
            }
          >
            <MaterialIcons name="fiber-manual-record" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Resume Session</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#4CAF50" }]}
            onPress={() =>
              router.push({
                pathname: "/start-session",
                params: { goalId: goal.id },
              })
            }
          >
            <MaterialIcons name="play-arrow" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Start Session</Text>
          </TouchableOpacity>
        )}

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.secondaryBtn, { flex: 1, marginRight: 6 }]}
            onPress={() =>
              router.push({
                pathname: "/edit-goal",
                params: { id: goal.id },
              })
            }
          >
            <MaterialIcons name="edit" size={18} color="#2196F3" />
            <Text style={styles.secondaryBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, { flex: 1, marginLeft: 6 }]}
            onPress={() =>
              router.push({
                pathname: "/session-history",
                params: { goalId: goal.id },
              })
            }
          >
            <MaterialIcons name="history" size={18} color="#2196F3" />
            <Text style={styles.secondaryBtnText}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {recentSessions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {recentSessions.map((s) => (
            <View key={s.id} style={styles.sessionRow}>
              <View>
                <Text style={styles.sessionDate}>
                  {s.startTime.toLocaleDateString()}
                </Text>
                {s.notes ? (
                  <Text style={styles.sessionNotes}>{s.notes}</Text>
                ) : null}
              </View>
              <Text style={styles.sessionDuration}>
                {formatDuration(s.durationSeconds)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <MaterialIcons name="delete" size={18} color="#F44336" />
        <Text style={styles.deleteBtnText}>Delete Goal</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  loadingText: { textAlign: "center", marginTop: 40, color: "#999" },
  headerSection: { alignItems: "center", marginBottom: 24 },
  icon: { fontSize: 48, marginBottom: 8 },
  name: { fontSize: 24, fontWeight: "bold", color: "#212121" },
  hours: { fontSize: 16, color: "#757575", marginTop: 4, marginBottom: 12 },
  progressBarBg: {
    width: "100%",
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: { height: 10, backgroundColor: "#4CAF50", borderRadius: 5 },
  percentText: { fontSize: 14, color: "#4CAF50", marginTop: 6, fontWeight: "600" },
  actions: { marginBottom: 24 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  actionBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 6 },
  row: { flexDirection: "row" },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  secondaryBtnText: { color: "#2196F3", fontWeight: "600", marginLeft: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#212121", marginBottom: 10 },
  sessionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sessionDate: { fontSize: 14, color: "#212121" },
  sessionNotes: { fontSize: 12, color: "#999", marginTop: 2 },
  sessionDuration: { fontSize: 14, fontWeight: "600", color: "#212121" },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginBottom: 40,
  },
  deleteBtnText: { color: "#F44336", fontWeight: "600", marginLeft: 4 },
});
