import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import {
  getGoalById,
  getActiveSession,
  startSession,
  endSession,
} from "@/db";
import type { Goal, Session } from "@/db";

export default function StartSessionScreen() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [notes, setNotes] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!goalId) return;
      (async () => {
        const g = await getGoalById(Number(goalId));
        setGoal(g);
        const active = await getActiveSession(Number(goalId));
        if (active) {
          setActiveSession(active);
          setNotes(active.notes ?? "");
          const diff = Math.floor(
            (Date.now() - active.startTime.getTime()) / 1000,
          );
          setElapsed(diff);
        }
      })();
    }, [goalId]),
  );

  useEffect(() => {
    if (activeSession) {
      intervalRef.current = setInterval(() => {
        setElapsed(
          Math.floor((Date.now() - activeSession.startTime.getTime()) / 1000),
        );
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeSession]);

  const handleStart = async () => {
    if (!goalId) return;
    await startSession(Number(goalId), notes || undefined);
    const active = await getActiveSession(Number(goalId));
    setActiveSession(active);
    setElapsed(0);
  };

  const handleStop = async () => {
    if (!activeSession) return;
    await endSession(activeSession.id);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActiveSession(null);
    router.back();
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!goal) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.goalInfo}>
        <Text style={styles.icon}>{goal.icon ?? "🎯"}</Text>
        <Text style={styles.goalName}>{goal.name}</Text>
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
        {activeSession && (
          <Text style={styles.startedAt}>
            Started at {activeSession.startTime.toLocaleTimeString()}
          </Text>
        )}
      </View>

      {!activeSession && (
        <TextInput
          style={styles.notesInput}
          placeholder="Session notes (optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      )}

      <View style={styles.controls}>
        {activeSession ? (
          <TouchableOpacity style={styles.stopBtn} onPress={handleStop}>
            <MaterialIcons name="stop" size={32} color="#fff" />
            <Text style={styles.btnText}>Stop Session</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
            <MaterialIcons name="play-arrow" size={32} color="#fff" />
            <Text style={styles.btnText}>Start Session</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  loadingText: { textAlign: "center", marginTop: 40, color: "#999" },
  goalInfo: { alignItems: "center", marginTop: 20 },
  icon: { fontSize: 48 },
  goalName: { fontSize: 22, fontWeight: "bold", color: "#212121", marginTop: 8 },
  timerContainer: { alignItems: "center", marginTop: 40 },
  timerText: { fontSize: 64, fontWeight: "200", color: "#212121", fontVariant: ["tabular-nums"] },
  startedAt: { fontSize: 14, color: "#999", marginTop: 8 },
  notesInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 30,
    minHeight: 60,
    textAlignVertical: "top",
  },
  controls: { flex: 1, justifyContent: "center", alignItems: "center" },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  stopBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F44336",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  btnText: { color: "#fff", fontSize: 20, fontWeight: "bold", marginLeft: 8 },
});
