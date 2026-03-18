import { useCallback, useState } from "react";
import { ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect, type Href } from "expo-router";
import {
  getAllGoals,
  getGoalProgress,
  getStatsForDateRange,
  getTotalSessionHistory,
} from "@/db";
import { View, Text, useColors } from "@/components/Themed";
import { MiniLineChart } from "@/components/Charts";
import Colors from "@/constants/Colors";
import ScreenLayout from "@/components/ScreenLayout";
import { useHabits } from "@/context/habits-context";
import type { Goal } from "@/db";

type GoalWithProgress = Goal & {
  totalHours: number;
  percentage: number;
  last7DaysSeconds: number;
};

export default function HomeScreen() {
  const router = useRouter();
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);
  const [totalHoursAll, setTotalHoursAll] = useState(0);
  const [sessionChartData, setSessionChartData] = useState<number[]>([]);
  const [sessionChartLabels, setSessionChartLabels] = useState<string[]>([]);
  const { dailyHabits, streaks, toggleHabit } = useHabits();
  const c = useColors();

  const bestStreak = Math.max(0, ...Object.values(streaks));

  const loadGoals = useCallback(async () => {
    const allGoals = await getAllGoals();
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    let total = 0;
    const withProgress = await Promise.all(
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
            Math.round((progress.totalHours / (g.goalHours ?? 100)) * 100),
          ),
          last7DaysSeconds: weekSeconds,
        };
      }),
    );
    setGoals(withProgress);
    setTotalHoursAll(total);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGoals();
      // Load session chart data
      (async () => {
        const history = await getTotalSessionHistory(7);
        setSessionChartData(history.map((d) => Math.round(d.hours * 10) / 10));
        setSessionChartLabels(
          history.map((d) => {
            const dt = new Date(d.date + "T00:00:00");
            return dt
              .toLocaleDateString("en", { weekday: "short" })
              .slice(0, 3);
          }),
        );
      })();
    }, [loadGoals]),
  );

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const completedHabits = dailyHabits.filter((h) => h.completed).length;

  return (
    <ScreenLayout insideTabs>
      <ScrollView
        style={[styles.container, { backgroundColor: c.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: "transparent" }]}>
          <View style={{ backgroundColor: "transparent" }}>
            <Text style={[styles.greeting, { color: c.textMuted }]}>
              Welcome back
            </Text>
            <Text style={[styles.title, { color: c.text }]}>Legendary</Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: Colors.accent }]}
            onPress={() => router.push("/create-goal" as Href)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats Hero */}
        <View style={[styles.heroCard, { backgroundColor: Colors.accent }]}>
          <View style={[styles.heroRow, { backgroundColor: "transparent" }]}>
            <View style={[styles.heroStat, { backgroundColor: "transparent" }]}>
              <View style={styles.heroIconWrap}>
                <MaterialIcons
                  name="local-fire-department"
                  size={20}
                  color="#fff"
                />
              </View>
              <Text style={styles.heroValue}>{bestStreak}</Text>
              <Text style={styles.heroLabel}>Streak</Text>
            </View>
            <View
              style={[
                styles.heroDivider,
                { backgroundColor: "rgba(255,255,255,0.2)" },
              ]}
            />
            <View style={[styles.heroStat, { backgroundColor: "transparent" }]}>
              <View style={styles.heroIconWrap}>
                <MaterialIcons name="timer" size={20} color="#fff" />
              </View>
              <Text style={styles.heroValue}>{totalHoursAll.toFixed(1)}h</Text>
              <Text style={styles.heroLabel}>Hours</Text>
            </View>
            <View
              style={[
                styles.heroDivider,
                { backgroundColor: "rgba(255,255,255,0.2)" },
              ]}
            />
            <View style={[styles.heroStat, { backgroundColor: "transparent" }]}>
              <View style={styles.heroIconWrap}>
                <MaterialIcons name="flag" size={20} color="#fff" />
              </View>
              <Text style={styles.heroValue}>{goals.length}</Text>
              <Text style={styles.heroLabel}>Goals</Text>
            </View>
            <View
              style={[
                styles.heroDivider,
                { backgroundColor: "rgba(255,255,255,0.2)" },
              ]}
            />
            <View style={[styles.heroStat, { backgroundColor: "transparent" }]}>
              <View style={styles.heroIconWrap}>
                <MaterialIcons name="check-circle" size={20} color="#fff" />
              </View>
              <Text style={styles.heroValue}>
                {completedHabits}/{dailyHabits.length}
              </Text>
              <Text style={styles.heroLabel}>Habits</Text>
            </View>
          </View>
        </View>

        {/* Today's Habits */}
        {dailyHabits.length > 0 && (
          <View style={{ backgroundColor: "transparent" }}>
            <View
              style={[styles.sectionHeader, { backgroundColor: "transparent" }]}
            >
              <Text style={[styles.sectionTitle, { color: c.text }]}>
                Today's Habits
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/habit-tracker" as Href)}
                activeOpacity={0.7}
              >
                <Text style={[styles.seeAll, { color: Colors.accent }]}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.habitsCard,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
            >
              {dailyHabits.slice(0, 5).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.habitRow,
                    { borderBottomColor: c.border },
                    dailyHabits.indexOf(item) ===
                      Math.min(4, dailyHabits.length - 1) && {
                      borderBottomWidth: 0,
                    },
                  ]}
                  onPress={() => toggleHabit(item.id)}
                  activeOpacity={0.6}
                >
                  <View
                    style={[
                      styles.checkWrap,
                      {
                        backgroundColor: item.completed
                          ? Colors.accent
                          : "transparent",
                        borderColor: item.completed ? Colors.accent : c.border,
                      },
                    ]}
                  >
                    {item.completed && (
                      <MaterialIcons name="check" size={14} color="#fff" />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.habitName,
                      {
                        color: item.completed ? c.textMuted : c.text,
                        textDecorationLine: item.completed
                          ? "line-through"
                          : "none",
                      },
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Session Hours Chart */}
        {sessionChartData.some((v) => v > 0) && (
          <View
            style={[
              styles.chartCard,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <Text style={[styles.chartTitle, { color: c.text }]}>
              Session Hours (7 days)
            </Text>
            <MiniLineChart
              data={sessionChartData}
              labels={sessionChartLabels}
              height={160}
              suffix="h"
            />
          </View>
        )}

        {/* Goals */}
        <View
          style={[styles.sectionHeader, { backgroundColor: "transparent" }]}
        >
          <Text style={[styles.sectionTitle, { color: c.text }]}>
            Your Goals
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/create-goal" as Href)}
            activeOpacity={0.7}
          >
            <Text style={[styles.seeAll, { color: Colors.accent }]}>+ New</Text>
          </TouchableOpacity>
        </View>

        {goals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconWrap,
                { backgroundColor: Colors.accentLight },
              ]}
            >
              <MaterialIcons name="flag" size={40} color={Colors.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: c.text }]}>
              No goals yet
            </Text>
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>
              Set a goal and start tracking your progress
            </Text>
            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: Colors.accent }]}
              onPress={() => router.push("/create-goal" as Href)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="add" size={20} color="#fff" />
              <Text style={styles.createBtnText}>Create Your First Goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          goals.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.goalCard,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/goal-details",
                  params: { id: item.id },
                } as Href)
              }
              activeOpacity={0.7}
            >
              <View
                style={[styles.goalHeader, { backgroundColor: "transparent" }]}
              >
                <View
                  style={[styles.iconWrap, { backgroundColor: c.surfaceAlt }]}
                >
                  <Text style={styles.goalIcon}>{item.icon ?? "🎯"}</Text>
                </View>
                <View
                  style={[styles.goalInfo, { backgroundColor: "transparent" }]}
                >
                  <Text style={[styles.goalName, { color: c.text }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.goalHours, { color: c.textSecondary }]}>
                    {item.totalHours.toFixed(1)}h of {item.goalHours ?? 100}h
                  </Text>
                </View>
                <View
                  style={[
                    styles.percentBadge,
                    {
                      backgroundColor:
                        item.percentage >= 75
                          ? c.successLight
                          : Colors.accentLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.percentText,
                      {
                        color:
                          item.percentage >= 75 ? c.success : Colors.accent,
                      },
                    ]}
                  >
                    {item.percentage}%
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.progressBarBg,
                  { backgroundColor: c.surfaceAlt },
                ]}
              >
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${item.percentage}%`,
                      backgroundColor:
                        item.percentage >= 75 ? c.success : Colors.accent,
                    },
                  ]}
                />
              </View>
              <View
                style={[styles.weekRow, { backgroundColor: "transparent" }]}
              >
                <MaterialIcons
                  name="trending-up"
                  size={14}
                  color={Colors.accent}
                />
                <Text style={[styles.weekText, { color: c.textSecondary }]}>
                  Last 7 days: {formatDuration(item.last7DaysSeconds)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 30, backgroundColor: "transparent" }} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { fontSize: 14, marginBottom: 2 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  heroStat: { alignItems: "center", flex: 1 },
  heroIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 2,
  },
  heroLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  heroDivider: { width: 1, height: 50, borderRadius: 1 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: "700" },
  seeAll: { fontSize: 14, fontWeight: "600" },
  habitsCard: {
    borderRadius: 16,
    padding: 4,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
  },
  checkWrap: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  habitName: { fontSize: 15, fontWeight: "500" },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "transparent",
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", marginBottom: 6 },
  emptyText: { fontSize: 15, textAlign: "center", marginBottom: 24 },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  createBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 6,
  },
  goalCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  goalIcon: { fontSize: 24 },
  goalInfo: { flex: 1 },
  goalName: { fontSize: 17, fontWeight: "700" },
  goalHours: { fontSize: 13, marginTop: 2 },
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
    marginBottom: 10,
  },
  progressBarFill: { height: 6, borderRadius: 3 },
  weekRow: { flexDirection: "row", alignItems: "center" },
  weekText: { fontSize: 12, marginLeft: 5 },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  chartTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
});
