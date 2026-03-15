import { useCallback, useState } from "react";
import { ScrollView, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
  useFocusEffect,
  type Href,
} from "expo-router";
import {
  getGoalById,
  getGoalProgress,
  getSessionsByGoal,
  deleteGoal,
  getActiveSession,
} from "@/db";
import { View, Text, useColors } from "@/components/Themed";
import Colors from "@/constants/Colors";
import ScreenLayout from "@/components/ScreenLayout";
import type { Goal, Session } from "@/db";

export default function GoalDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [progress, setProgress] = useState({ totalHours: 0, totalSeconds: 0 });
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const c = useColors();

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
      <ScreenLayout fullScreen>
        <View style={styles.container}>
          <Text style={[styles.loadingText, { color: c.textMuted }]}>
            Loading...
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  const percentage = Math.min(
    100,
    Math.round((progress.totalHours / (goal.goalHours ?? 100)) * 100),
  );

  return (
    <ScreenLayout fullScreen>
      <ScrollView
        style={[styles.container, { backgroundColor: c.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.heroCard, { backgroundColor: Colors.accent }]}>
          <Text style={styles.heroIcon}>{goal.icon ?? "🎯"}</Text>
          <Text style={styles.heroName}>{goal.name}</Text>
          <Text style={styles.heroHours}>
            {progress.totalHours.toFixed(1)}h of {goal.goalHours ?? 100}h
          </Text>
          <View style={styles.heroProgressBg}>
            <View
              style={[styles.heroProgressFill, { width: `${percentage}%` }]}
            />
          </View>
          <Text style={styles.heroPercent}>{percentage}% complete</Text>
        </View>

        {/* Actions */}
        <View style={[styles.actions, { backgroundColor: "transparent" }]}>
          {activeSession ? (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: c.danger }]}
              onPress={() =>
                router.push({
                  pathname: "/start-session",
                  params: { goalId: goal.id },
                } as Href)
              }
              activeOpacity={0.8}
            >
              <View style={styles.liveDotWrap}>
                <View style={styles.liveDot} />
              </View>
              <Text style={styles.primaryBtnText}>Resume Session</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: Colors.accent }]}
              onPress={() =>
                router.push({
                  pathname: "/start-session",
                  params: { goalId: goal.id },
                } as Href)
              }
              activeOpacity={0.8}
            >
              <MaterialIcons name="play-arrow" size={22} color="#fff" />
              <Text style={styles.primaryBtnText}>Start Session</Text>
            </TouchableOpacity>
          )}

          <View style={[styles.btnRow, { backgroundColor: "transparent" }]}>
            <TouchableOpacity
              style={[
                styles.outlineBtn,
                {
                  borderColor: c.border,
                  backgroundColor: c.card,
                  flex: 1,
                  marginRight: 6,
                },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/edit-goal",
                  params: { id: goal.id },
                } as Href)
              }
              activeOpacity={0.7}
            >
              <MaterialIcons name="edit" size={18} color={Colors.accent} />
              <Text style={[styles.outlineBtnText, { color: Colors.accent }]}>
                Edit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.outlineBtn,
                {
                  borderColor: c.border,
                  backgroundColor: c.card,
                  flex: 1,
                  marginLeft: 6,
                },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/session-history",
                  params: { goalId: goal.id },
                } as Href)
              }
              activeOpacity={0.7}
            >
              <MaterialIcons name="history" size={18} color={Colors.accent} />
              <Text style={[styles.outlineBtnText, { color: Colors.accent }]}>
                History
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <View style={[styles.section, { backgroundColor: "transparent" }]}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>
              Recent Sessions
            </Text>
            {recentSessions.map((s) => (
              <View
                key={s.id}
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
                    {s.startTime.toLocaleDateString()}
                  </Text>
                  {s.notes ? (
                    <Text style={[styles.sessionNotes, { color: c.textMuted }]}>
                      {s.notes}
                    </Text>
                  ) : null}
                </View>
                <Text style={[styles.sessionDuration, { color: c.text }]}>
                  {formatDuration(s.durationSeconds)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Delete */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <MaterialIcons name="delete-outline" size={18} color={c.danger} />
          <Text style={[styles.deleteBtnText, { color: c.danger }]}>
            Delete Goal
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40, backgroundColor: "transparent" }} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  loadingText: { textAlign: "center", marginTop: 40 },
  heroCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
    shadowColor: "#E73B37",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  heroIcon: { fontSize: 48, marginBottom: 8 },
  heroName: { fontSize: 24, fontWeight: "800", color: "#fff" },
  heroHours: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
    marginBottom: 16,
  },
  heroProgressBg: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 4,
    overflow: "hidden",
  },
  heroProgressFill: {
    height: 8,
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  heroPercent: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "700",
    marginTop: 8,
  },
  actions: { marginBottom: 24 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: "#E73B37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  liveDotWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#fff" },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 4,
  },
  btnRow: { flexDirection: "row" },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  outlineBtnText: { fontWeight: "600", marginLeft: 6 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  sessionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sessionDate: { fontSize: 15, fontWeight: "500" },
  sessionNotes: { fontSize: 13, marginTop: 2 },
  sessionDuration: { fontSize: 15, fontWeight: "700" },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  deleteBtnText: { fontWeight: "600", marginLeft: 4 },
});
