import { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { getAllGoals, getGoalProgress, getStatsForDateRange } from "@/db";
import type { Goal } from "@/db";

type GoalStat = Goal & {
  totalHours: number;
  percentage: number;
  last7DaysSeconds: number;
};

export default function StatsScreen() {
  const [stats, setStats] = useState<GoalStat[]>([]);
  const [totalHoursAll, setTotalHoursAll] = useState(0);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const allGoals = await getAllGoals();
        const now = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);

        let total = 0;
        const goalStats = await Promise.all(
          allGoals.map(async (g) => {
            const progress = await getGoalProgress(g.id);
            const weekStats = await getStatsForDateRange(g.id, weekAgo, now);
            const weekSeconds = weekStats.reduce(
              (sum, s) => sum + s.durationSeconds,
              0,
            );
            total += progress.totalHours;
            return {
              ...g,
              totalHours: progress.totalHours,
              percentage: Math.min(
                100,
                Math.round(
                  (progress.totalHours / (g.goalHours ?? 100)) * 100,
                ),
              ),
              last7DaysSeconds: weekSeconds,
            };
          }),
        );
        setStats(goalStats);
        setTotalHoursAll(total);
      })();
    }, []),
  );

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.summaryCard}>
        <MaterialIcons name="insights" size={32} color="#2196F3" />
        <Text style={styles.summaryLabel}>Total Hours Logged</Text>
        <Text style={styles.summaryValue}>{totalHoursAll.toFixed(1)}h</Text>
      </View>

      {stats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No stats yet. Start a session!</Text>
        </View>
      ) : (
        stats.map((g) => (
          <View key={g.id} style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.goalIcon}>{g.icon ?? "🎯"}</Text>
              <View style={styles.statInfo}>
                <Text style={styles.goalName}>{g.name}</Text>
                <Text style={styles.goalSub}>
                  {g.totalHours.toFixed(1)}h / {g.goalHours ?? 100}h
                </Text>
              </View>
              <Text style={styles.percentBadge}>{g.percentage}%</Text>
            </View>

            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${g.percentage}%` },
                ]}
              />
            </View>

            <View style={styles.weekRow}>
              <MaterialIcons name="date-range" size={16} color="#757575" />
              <Text style={styles.weekText}>
                Last 7 days: {formatDuration(g.last7DaysSeconds)}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  summaryCard: {
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  summaryLabel: { fontSize: 14, color: "#1565C0", marginTop: 8 },
  summaryValue: { fontSize: 36, fontWeight: "bold", color: "#0D47A1" },
  emptyContainer: { alignItems: "center", marginTop: 40 },
  emptyText: { fontSize: 16, color: "#999" },
  statCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  goalIcon: { fontSize: 28, marginRight: 10 },
  statInfo: { flex: 1 },
  goalName: { fontSize: 16, fontWeight: "600", color: "#212121" },
  goalSub: { fontSize: 13, color: "#757575", marginTop: 2 },
  percentBadge: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressBarFill: { height: 6, backgroundColor: "#4CAF50", borderRadius: 3 },
  weekRow: { flexDirection: "row", alignItems: "center" },
  weekText: { fontSize: 13, color: "#757575", marginLeft: 4 },
});
