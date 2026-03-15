import { useCallback, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { getAllGoals, getGoalProgress, getStatsForDateRange } from "@/db";
import { View, Text, useColors } from "@/components/Themed";
import Colors from "@/constants/Colors";
import type { Goal } from "@/db";

type GoalStat = Goal & {
  totalHours: number;
  percentage: number;
  last7DaysSeconds: number;
};

export default function StatsScreen() {
  const [stats, setStats] = useState<GoalStat[]>([]);
  const [totalHoursAll, setTotalHoursAll] = useState(0);
  const c = useColors();

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
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.pageTitle, { color: c.text }]}>Stats</Text>

      <View style={[styles.heroCard, { backgroundColor: Colors.accent }]}>
        <View style={styles.heroIconWrap}>
          <MaterialIcons name="local-fire-department" size={28} color="#fff" />
        </View>
        <Text style={styles.heroLabel}>Total Hours Logged</Text>
        <Text style={styles.heroValue}>{totalHoursAll.toFixed(1)}h</Text>
        <Text style={styles.heroSub}>{stats.length} active goals</Text>
      </View>

      {stats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>
            No stats yet. Start a session!
          </Text>
        </View>
      ) : (
        stats.map((g) => (
          <View
            key={g.id}
            style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}
          >
            <View style={[styles.statHeader, { backgroundColor: "transparent" }]}>
              <View style={[styles.iconWrap, { backgroundColor: c.surfaceAlt }]}>
                <Text style={styles.goalIcon}>{g.icon ?? "🎯"}</Text>
              </View>
              <View style={[styles.statInfo, { backgroundColor: "transparent" }]}>
                <Text style={[styles.goalName, { color: c.text }]}>
                  {g.name}
                </Text>
                <Text style={[styles.goalSub, { color: c.textSecondary }]}>
                  {g.totalHours.toFixed(1)}h of {g.goalHours ?? 100}h
                </Text>
              </View>
              <View
                style={[
                  styles.percentBadge,
                  {
                    backgroundColor:
                      g.percentage >= 75 ? c.successLight : Colors.accentLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.percentText,
                    {
                      color: g.percentage >= 75 ? c.success : Colors.accent,
                    },
                  ]}
                >
                  {g.percentage}%
                </Text>
              </View>
            </View>

            <View style={[styles.progressBarBg, { backgroundColor: c.surfaceAlt }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${g.percentage}%`,
                    backgroundColor:
                      g.percentage >= 75 ? c.success : Colors.accent,
                  },
                ]}
              />
            </View>

            <View style={[styles.weekRow, { backgroundColor: "transparent" }]}>
              <MaterialIcons name="trending-up" size={16} color={Colors.accent} />
              <Text style={[styles.weekText, { color: c.textSecondary }]}>
                Last 7 days: {formatDuration(g.last7DaysSeconds)}
              </Text>
            </View>
          </View>
        ))
      )}

      <View style={{ height: 30, backgroundColor: "transparent" }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  pageTitle: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5, marginBottom: 20 },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#E73B37",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  heroLabel: { fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: "600" },
  heroValue: { fontSize: 44, fontWeight: "800", color: "#fff", marginVertical: 4 },
  heroSub: { fontSize: 13, color: "rgba(255,255,255,0.7)" },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
    backgroundColor: "transparent",
  },
  emptyText: { fontSize: 16 },
  statCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  goalIcon: { fontSize: 20 },
  statInfo: { flex: 1 },
  goalName: { fontSize: 16, fontWeight: "700" },
  goalSub: { fontSize: 13, marginTop: 2 },
  percentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  percentText: { fontSize: 13, fontWeight: "700" },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBarFill: { height: 6, borderRadius: 3 },
  weekRow: { flexDirection: "row", alignItems: "center" },
  weekText: { fontSize: 13, marginLeft: 6 },
})
