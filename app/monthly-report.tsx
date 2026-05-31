import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter, type Href } from "expo-router";
import {
  getGoalById,
  getGoalTotalsForMonth,
  getMonthlyGoalsForMonth,
  getSessionsByGoalInRange,
} from "@/db";
import ScreenLayout from "@/components/ScreenLayout";
import { View, Text, useColors } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { MonthSelector } from "@/components/MonthSelector";
import {
  getMonthKey,
  getMonthDateRange,
  monthKeyToDate,
  type MonthKey,
} from "@/utils/month";
import type { Goal, Session } from "@/db";

type GoalSummary = {
  goal: Goal;
  totalHours: number;
  totalSeconds: number;
  totalSessions: number;
  percentage: number;
};

export default function MonthlyReportScreen() {
  const params = useLocalSearchParams<{ monthKey?: string; goalId?: string }>();
  const router = useRouter();
  const c = useColors();

  const initialMonth = useMemo(() => {
    const key =
      params.monthKey && typeof params.monthKey === "string"
        ? (params.monthKey as MonthKey)
        : getMonthKey(new Date());
    const d = monthKeyToDate(key);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [params.monthKey]);

  const [month, setMonth] = useState<Date>(initialMonth);
  const monthKey = getMonthKey(month);

  const [summaries, setSummaries] = useState<GoalSummary[]>([]);
  const [focusedGoal, setFocusedGoal] = useState<Goal | null>(null);
  const [focusedSessions, setFocusedSessions] = useState<Session[]>([]);

  const goalId = params.goalId ? Number(params.goalId) : null;

  const load = useCallback(async () => {
    if (goalId && Number.isFinite(goalId)) {
      const goal = await getGoalById(goalId);
      setFocusedGoal(goal);
      if (!goal) return;

      const totals = await getGoalTotalsForMonth(goalId, monthKey);
      const { start, end } = getMonthDateRange(monthKey);
      setFocusedSessions(await getSessionsByGoalInRange(goalId, start, end));
      setSummaries([
        {
          goal,
          totalHours: totals.totalHours,
          totalSeconds: totals.totalSeconds,
          totalSessions: totals.totalSessions,
          percentage: Math.min(
            100,
            Math.round((totals.totalHours / (goal.goalHours ?? 100)) * 100),
          ),
        },
      ]);
      return;
    }

    setFocusedGoal(null);
    setFocusedSessions([]);
    const goals = await getMonthlyGoalsForMonth(monthKey);
    const next = await Promise.all(
      goals.map(async (g) => {
        const totals = await getGoalTotalsForMonth(g.id, monthKey);
        return {
          goal: g,
          totalHours: totals.totalHours,
          totalSeconds: totals.totalSeconds,
          totalSessions: totals.totalSessions,
          percentage: Math.min(
            100,
            Math.round((totals.totalHours / (g.goalHours ?? 100)) * 100),
          ),
        };
      }),
    );
    setSummaries(next);
  }, [goalId, monthKey]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <ScreenLayout fullScreen>
      <ScrollView
        style={[styles.container, { backgroundColor: c.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerRow, { backgroundColor: "transparent" }]}>
          <Text style={[styles.title, { color: c.text }]}>Monthly Report</Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/create-goal",
                params: { timeframe: "monthly", monthKey },
              } as Href)
            }
            activeOpacity={0.75}
            style={[styles.newBtn, { backgroundColor: Colors.accentLight }]}
          >
            <MaterialIcons name="add" size={18} color={Colors.accent} />
            <Text style={[styles.newBtnText, { color: Colors.accent }]}>
              New
            </Text>
          </TouchableOpacity>
        </View>

        <MonthSelector month={month} onMonthChange={setMonth} />

        {goalId && (
          <TouchableOpacity
            onPress={() => router.replace("/monthly-report" as Href)}
            activeOpacity={0.7}
            style={{ marginTop: 14, backgroundColor: "transparent" }}
          >
            <Text style={[styles.backText, { color: Colors.accent }]}>
              ← All monthly goals
            </Text>
          </TouchableOpacity>
        )}

        {summaries.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: "transparent" }]}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: Colors.accentLight },
              ]}
            >
              <MaterialIcons name="date-range" size={38} color={Colors.accent} />
              
            </View>
            <Text style={[styles.emptyTitle, { color: c.text }]}>
              No monthly goals for this month
            </Text>
            <Text style={[styles.emptySub, { color: c.textSecondary }]}>
              Add one and lock in for the month.
            </Text>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/create-goal",
                  params: { timeframe: "monthly", monthKey },
                } as Href)
              }
              activeOpacity={0.8}
              style={[styles.ctaBtn, { backgroundColor: Colors.accent }]}
            >
              <MaterialIcons name="flag" size={20} color="#fff" />
              <Text style={styles.ctaText}>Create Monthly Goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ marginTop: 14, backgroundColor: "transparent" }}>
            {summaries.map((s) => (
              <TouchableOpacity
                key={s.goal.id}
                style={[
                  styles.card,
                  { backgroundColor: c.card, borderColor: c.border },
                ]}
                activeOpacity={0.75}
                onPress={() => {
                  if (goalId) return;
                  router.push({
                    pathname: "/monthly-report",
                    params: { goalId: s.goal.id, monthKey },
                  } as Href);
                }}
              >
                <View
                  style={[styles.cardHeader, { backgroundColor: "transparent" }]}
                >
                  <View style={[styles.iconWrap, { backgroundColor: c.surfaceAlt }]}>
                    <Text style={styles.icon}>{s.goal.icon ?? "🎯"}</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: "transparent" }}>
                    <Text style={[styles.goalName, { color: c.text }]}>
                      {s.goal.name}
                    </Text>
                    <Text style={[styles.sub, { color: c.textSecondary }]}>
                      {s.totalHours.toFixed(1)}h of {s.goal.goalHours ?? 100}h •{" "}
                      {s.totalSessions} sessions
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor:
                          s.percentage >= 100 ? c.successLight : Colors.accentLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color: s.percentage >= 100 ? c.success : Colors.accent,
                        },
                      ]}
                    >
                      {s.percentage >= 100 ? "Crushed" : `${s.percentage}%`}
                    </Text>
                  </View>
                </View>

                <View style={[styles.barBg, { backgroundColor: c.surfaceAlt }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.min(100, s.percentage)}%`,
                        backgroundColor: s.percentage >= 100 ? c.success : Colors.accent,
                      },
                    ]}
                  />
                </View>

                {goalId && focusedGoal?.id === s.goal.id ? (
                  <View style={{ marginTop: 14, backgroundColor: "transparent" }}>
                    <Text style={[styles.sessionsTitle, { color: c.text }]}>
                      Sessions in {month.toLocaleString("en-US", { month: "short" })}
                    </Text>
                    {focusedSessions.length === 0 ? (
                      <Text style={[styles.noSessions, { color: c.textMuted }]}>
                        No sessions logged this month yet.
                      </Text>
                    ) : (
                      focusedSessions.slice(0, 20).map((session) => (
                        <View
                          key={session.id}
                          style={[
                            styles.sessionRow,
                            {
                              borderBottomColor: c.border,
                              backgroundColor: "transparent",
                            },
                          ]}
                        >
                          <View style={{ backgroundColor: "transparent" }}>
                            <Text style={[styles.sessionDate, { color: c.text }]}>
                              {session.startTime.toLocaleDateString()}
                            </Text>
                            {session.notes ? (
                              <Text style={[styles.sessionNotes, { color: c.textMuted }]}>
                                {session.notes}
                              </Text>
                            ) : null}
                          </View>
                          <Text style={[styles.sessionDur, { color: c.text }]}>
                            {formatDuration(session.durationSeconds)}
                          </Text>
                        </View>
                      ))
                    )}

                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/goal-details",
                          params: { id: s.goal.id },
                        } as Href)
                      }
                      activeOpacity={0.7}
                      style={{ marginTop: 10, backgroundColor: "transparent" }}
                    >
                      <Text style={[styles.link, { color: Colors.accent }]}>
                        Open goal →
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 30, backgroundColor: "transparent" }} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  newBtnText: { fontSize: 13, fontWeight: "800", marginLeft: 4 },
  backText: { fontSize: 14, fontWeight: "700" },
  empty: { alignItems: "center", paddingVertical: 50 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: "800", marginBottom: 6 },
  emptySub: { fontSize: 15, textAlign: "center", marginBottom: 20 },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  ctaText: { color: "#fff", fontWeight: "800", marginLeft: 6, fontSize: 15 },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: { fontSize: 20 },
  goalName: { fontSize: 17, fontWeight: "800" },
  sub: { fontSize: 13, marginTop: 2 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginLeft: 12,
  },
  badgeText: { fontSize: 12, fontWeight: "800" },
  barBg: { height: 7, borderRadius: 4, overflow: "hidden" },
  barFill: { height: 7, borderRadius: 4 },
  sessionsTitle: { fontSize: 16, fontWeight: "800", marginBottom: 8 },
  noSessions: { fontSize: 13 },
  sessionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  sessionDate: { fontSize: 14, fontWeight: "600" },
  sessionNotes: { fontSize: 12, marginTop: 2 },
  sessionDur: { fontSize: 14, fontWeight: "800" },
  link: { fontSize: 14, fontWeight: "800" },
});
