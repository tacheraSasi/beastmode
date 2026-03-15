import { useCallback, useState } from "react";
import { FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect, type Href } from "expo-router";
import { getAllGoals, getGoalProgress } from "@/db";
import { View, Text, useColors } from "@/components/Themed";
import Colors from "@/constants/Colors";
import ScreenLayout from "@/components/ScreenLayout";
import type { Goal } from "@/db";

type GoalWithProgress = Goal & { totalHours: number; percentage: number };

export default function HomeScreen() {
  const router = useRouter();
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);
  const c = useColors();

  const loadGoals = useCallback(async () => {
    const allGoals = await getAllGoals();
    const withProgress = await Promise.all(
      allGoals.map(async (g) => {
        const progress = await getGoalProgress(g.id);
        return {
          ...g,
          totalHours: progress.totalHours,
          percentage: Math.min(
            100,
            Math.round((progress.totalHours / (g.goalHours ?? 100)) * 100),
          ),
        };
      }),
    );
    setGoals(withProgress);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [loadGoals]),
  );

  return (
    <ScreenLayout insideTabs>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ backgroundColor: "transparent" }}>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={[styles.title, { color: c.text }]}>Your Goals</Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: Colors.accent }]}
            onPress={() => router.push("/create-goal" as Href)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={22} color="#fff" />
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
          <FlatList
            data={goals}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity
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
                  style={[
                    styles.goalHeader,
                    { backgroundColor: "transparent" },
                  ]}
                >
                  <View
                    style={[styles.iconWrap, { backgroundColor: c.surfaceAlt }]}
                  >
                    <Text style={styles.goalIcon}>{item.icon ?? "🎯"}</Text>
                  </View>
                  <View
                    style={[
                      styles.goalInfo,
                      { backgroundColor: "transparent" },
                    ]}
                  >
                    <Text style={[styles.goalName, { color: c.text }]}>
                      {item.name}
                    </Text>
                    <Text
                      style={[styles.goalHours, { color: c.textSecondary }]}
                    >
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
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "transparent",
  },
  greeting: { fontSize: 14, color: "#9CA3AF", marginBottom: 2 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E73B37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
  emptyText: { fontSize: 15, textAlign: "center", marginBottom: 24 },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: "#E73B37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
  },
  progressBarFill: { height: 6, borderRadius: 3 },
});
