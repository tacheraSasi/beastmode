import { useCallback, useState } from "react";
import { FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect, type Href } from "expo-router";
import { getAllGoals, getActiveSession, getSessionsByGoal } from "@/db";
import { View, Text, useColors } from "@/components/Themed";
import Colors from "@/constants/Colors";
import ScreenLayout from "@/components/ScreenLayout";
import type { Goal, Session } from "@/db";

type GoalWithSession = Goal & {
  activeSession: Session | null;
  recentSessions: Session[];
};

export default function SessionsScreen() {
  const router = useRouter();
  const [goals, setGoals] = useState<GoalWithSession[]>([]);
  const c = useColors();

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
    <ScreenLayout insideTabs>
    <View style={styles.container}>
      <Text style={[styles.title, { color: c.text }]}>Sessions</Text>

      {goals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View
            style={[styles.emptyIconWrap, { backgroundColor: c.surfaceAlt }]}
          >
            <MaterialIcons name="timer" size={40} color={c.textMuted} />
          </View>
          <Text style={[styles.emptyTitle, { color: c.text }]}>
            No goals yet
          </Text>
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>
            Create a goal first to start tracking sessions
          </Text>
        </View>
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.goalCard,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
            >
              <View
                style={[styles.goalHeader, { backgroundColor: "transparent" }]}
              >
                <View
                  style={[styles.iconWrap, { backgroundColor: c.surfaceAlt }]}
                >
                  <Text style={styles.goalIcon}>{item.icon ?? "🎯"}</Text>
                </View>
                <Text style={[styles.goalName, { color: c.text }]}>
                  {item.name}
                </Text>
              </View>

              {item.activeSession ? (
                <TouchableOpacity
                  style={[
                    styles.activeSession,
                    { backgroundColor: c.dangerLight },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/start-session",
                      params: { goalId: item.id },
                    } as Href)
                  }
                  activeOpacity={0.7}
                >
                  <View
                    style={[styles.liveDot, { backgroundColor: c.danger }]}
                  />
                  <Text style={[styles.activeText, { color: c.danger }]}>
                    Session in progress
                  </Text>
                  <View
                    style={[styles.resumeChip, { backgroundColor: c.danger }]}
                  >
                    <Text style={styles.resumeChipText}>Resume</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.startBtn, { backgroundColor: Colors.accent }]}
                  onPress={() =>
                    router.push({
                      pathname: "/start-session",
                      params: { goalId: item.id },
                    } as Href)
                  }
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="play-arrow" size={20} color="#fff" />
                  <Text style={styles.startBtnText}>Start Session</Text>
                </TouchableOpacity>
              )}

              {item.recentSessions.length > 0 && (
                <View
                  style={[
                    styles.recentSection,
                    { backgroundColor: "transparent" },
                  ]}
                >
                  <Text style={[styles.recentLabel, { color: c.textMuted }]}>
                    RECENT
                  </Text>
                  {item.recentSessions.map((s) => (
                    <View
                      key={s.id}
                      style={[
                        styles.sessionRow,
                        {
                          backgroundColor: "transparent",
                          borderBottomColor: c.border,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.sessionDate, { color: c.textSecondary }]}
                      >
                        {s.startTime.toLocaleDateString()}
                      </Text>
                      <Text style={[styles.sessionDuration, { color: c.text }]}>
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
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.viewAllText, { color: Colors.accent }]}
                    >
                      View All History →
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
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
  emptyText: { fontSize: 15, textAlign: "center" },
  goalCard: {
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
  goalHeader: {
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
  goalName: { fontSize: 17, fontWeight: "700", flex: 1 },
  activeSession: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "transparent",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  activeText: { flex: 1, fontWeight: "600", fontSize: 14 },
  resumeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resumeChipText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  startBtnText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 4,
    fontSize: 15,
  },
  recentSection: { marginTop: 10 },
  recentLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  sessionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  sessionDate: { fontSize: 14 },
  sessionDuration: { fontSize: 14, fontWeight: "600" },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
  },
});
