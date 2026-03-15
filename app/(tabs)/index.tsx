import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { getAllGoals, getGoalProgress } from "@/db";
import type { Goal } from "@/db";

type GoalWithProgress = Goal & { totalHours: number; percentage: number };

export default function HomeScreen() {
  const router = useRouter();
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Goals</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/create-goal")}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {goals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="flag" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No goals yet.</Text>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => router.push("/create-goal")}
          >
            <Text style={styles.createBtnText}>Create Your First Goal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.goalCard}
              onPress={() =>
                router.push({
                  pathname: "/goal-details",
                  params: { id: item.id },
                })
              }
            >
              <View style={styles.goalHeader}>
                <Text style={styles.goalIcon}>{item.icon ?? "🎯"}</Text>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalName}>{item.name}</Text>
                  <Text style={styles.goalHours}>
                    {item.totalHours.toFixed(1)} / {item.goalHours ?? 100}h
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#999" />
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${item.percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.percentText}>{item.percentage}%</Text>
            </TouchableOpacity>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#212121" },
  addBtn: {
    backgroundColor: "#2196F3",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 16, color: "#999", marginTop: 12, marginBottom: 20 },
  createBtn: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  goalCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  goalHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  goalIcon: { fontSize: 32, marginRight: 12 },
  goalInfo: { flex: 1 },
  goalName: { fontSize: 18, fontWeight: "600", color: "#212121" },
  goalHours: { fontSize: 14, color: "#757575", marginTop: 2 },
  progressBarBg: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: { height: 8, backgroundColor: "#4CAF50", borderRadius: 4 },
  percentText: {
    fontSize: 12,
    color: "#757575",
    marginTop: 4,
    textAlign: "right",
  },
});
