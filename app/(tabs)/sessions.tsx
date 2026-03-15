import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect, type Href } from "expo-router";
import { getAllGoals, getActiveSession, getSessionsByGoal } from "@/db";
import type { Goal, Session } from "@/db";

type GoalWithSession = Goal & {
  activeSession: Session | null;
  recentSessions: Session[];
};

export default function SessionsScreen() {
  const router = useRouter();
  const [goals, setGoals] = useState<GoalWithSession[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const allGoals = await getAllGoals();
        const withSessions = await Promise.all(
          allGoals.map(async (g) => {
            const active = await getActiveSession(g.id);
            const recent = await getSessionsByGoal(g.id);
            return {
              ...g,
              activeSession: active,
              recentSessions: recent.slice(0, 3),
            };
          }),
        );
        setGoals(withSessions);
      })();
    }, []),
  );

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <View style={styles.container}>
      {goals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="timer" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            Create a goal first to start sessions.
          </Text>
        </View>
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalIcon}>{item.icon ?? "🎯"}</Text>
                <Text style={styles.goalName}>{item.name}</Text>
              </View>

              {item.activeSession ? (
                <View style={styles.activeSession}>
                  <MaterialIcons
                    name="fiber-manual-record"
                    size={12}
                    color="#F44336"
                  />
                  <Text style={styles.activeText}>Session in progress</Text>
                  <TouchableOpacity
                    style={styles.resumeBtn}
                    onPress={() =>
                      router.push({
                        pathname: "/start-session",
                        params: { goalId: item.id },
                      })
                    }
                  >
                    <Text style={styles.resumeBtnText}>Resume</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() =>
                    router.push({
                      pathname: "/start-session",
                      params: { goalId: item.id },
                    })
                  }
                >
                  <MaterialIcons name="play-arrow" size={20} color="#fff" />
                  <Text style={styles.startBtnText}>Start Session</Text>
                </TouchableOpacity>
              )}

              {item.recentSessions.length > 0 && (
                <View style={styles.recentSection}>
                  <Text style={styles.recentLabel}>Recent</Text>
                  {item.recentSessions.map((s) => (
                    <View key={s.id} style={styles.sessionRow}>
                      <Text style={styles.sessionDate}>
                        {s.startTime.toLocaleDateString()}
                      </Text>
                      <Text style={styles.sessionDuration}>
                        {formatDuration(s.durationSeconds)}
                      </Text>
                    </View>
                  ))}
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/session-history",
                        params: { goalId: item.id },
                      } as Href)
                    }
                  >
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 16, color: "#999", marginTop: 12 },
  goalCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  goalIcon: { fontSize: 24, marginRight: 8 },
  goalName: { fontSize: 18, fontWeight: "600", color: "#212121" },
  activeSession: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3F0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeText: { flex: 1, marginLeft: 6, color: "#F44336", fontWeight: "500" },
  resumeBtn: {
    backgroundColor: "#F44336",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resumeBtnText: { color: "#fff", fontWeight: "600" },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  startBtnText: { color: "#fff", fontWeight: "600", marginLeft: 4 },
  recentSection: { marginTop: 8 },
  recentLabel: {
    fontSize: 13,
    color: "#999",
    fontWeight: "600",
    marginBottom: 6,
  },
  sessionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  sessionDate: { color: "#555", fontSize: 14 },
  sessionDuration: { color: "#212121", fontSize: 14, fontWeight: "500" },
  viewAllText: {
    color: "#2196F3",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 6,
  },
});
