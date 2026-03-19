import { useCallback, useEffect, useRef, useState } from "react";
import { TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { getGoalById, getActiveSession, startSession, endSession } from "@/db";
import { View, Text, useColors } from "@/components/Themed";
import Colors from "@/constants/Colors";
import ScreenLayout from "@/components/ScreenLayout";
import {
  showActiveSessionNotification,
  updateActiveSessionNotification,
  dismissActiveSessionNotification,
} from "@/utils/notifications";
import type { Goal, Session } from "@/db";

export default function StartSessionScreen() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [notes, setNotes] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notifIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const c = useColors();

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
    if (activeSession && goal) {
      intervalRef.current = setInterval(() => {
        setElapsed(
          Math.floor((Date.now() - activeSession.startTime.getTime()) / 1000),
        );
      }, 1000);

      // Show notification immediately for resumed sessions
      const currentElapsed = Math.floor(
        (Date.now() - activeSession.startTime.getTime()) / 1000,
      );
      showActiveSessionNotification(
        goal.name,
        goal.icon ?? "🎯",
        currentElapsed,
      );

      // Update notification every 30 seconds
      notifIntervalRef.current = setInterval(() => {
        const secs = Math.floor(
          (Date.now() - activeSession.startTime.getTime()) / 1000,
        );
        updateActiveSessionNotification(goal.name, goal.icon ?? "🎯", secs);
      }, 30000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (notifIntervalRef.current) clearInterval(notifIntervalRef.current);
    };
  }, [activeSession, goal]);

  const handleStart = async () => {
    if (!goalId || !goal) return;
    await startSession(Number(goalId), notes || undefined);
    const active = await getActiveSession(Number(goalId));
    setActiveSession(active);
    setElapsed(0);
    // Notification is shown via the useEffect when activeSession changes
  };

  const handleStop = async () => {
    if (!activeSession) return;
    await endSession(activeSession.id);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (notifIntervalRef.current) clearInterval(notifIntervalRef.current);
    await dismissActiveSessionNotification();
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
      <ScreenLayout fullScreen>
        <View style={styles.container}>
          <Text style={[styles.loadingText, { color: c.textMuted }]}>
            Loading...
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout fullScreen>
      <View style={styles.container}>
        {/* Goal info */}
        <View style={[styles.goalInfo, { backgroundColor: "transparent" }]}>
          <View style={[styles.iconWrap, { backgroundColor: c.surfaceAlt }]}>
            <Text style={styles.icon}>{goal.icon ?? "🎯"}</Text>
          </View>
          <Text style={[styles.goalName, { color: c.text }]}>{goal.name}</Text>
        </View>

        {/* Timer */}
        <View
          style={[styles.timerContainer, { backgroundColor: "transparent" }]}
        >
          <View
            style={[
              styles.timerRing,
              {
                borderColor: activeSession ? Colors.accent : c.surfaceAlt,
              },
            ]}
          >
            <Text style={[styles.timerText, { color: c.text }]}>
              {formatTime(elapsed)}
            </Text>
            {activeSession && (
              <Text style={[styles.startedAt, { color: c.textMuted }]}>
                started{" "}
                {activeSession.startTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            )}
          </View>
        </View>

        {/* Notes */}
        {!activeSession && (
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: c.surfaceAlt,
                borderColor: c.border,
                color: c.text,
              },
            ]}
            placeholder="Session notes (optional)"
            placeholderTextColor={c.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        )}

        {/* Controls */}
        <View style={[styles.controls, { backgroundColor: "transparent" }]}>
          {activeSession ? (
            <TouchableOpacity
              style={[styles.stopBtn, { backgroundColor: c.danger }]}
              onPress={handleStop}
              activeOpacity={0.8}
            >
              <MaterialIcons name="stop" size={28} color="#fff" />
              <Text style={styles.btnText}>Stop Session</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.startBtn, { backgroundColor: Colors.accent }]}
              onPress={handleStart}
              activeOpacity={0.8}
            >
              <MaterialIcons name="play-arrow" size={28} color="#fff" />
              <Text style={styles.btnText}>Start Session</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  loadingText: { textAlign: "center", marginTop: 40 },
  goalInfo: { alignItems: "center", marginTop: 10 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 32 },
  goalName: { fontSize: 22, fontWeight: "800", marginTop: 10 },
  timerContainer: { alignItems: "center", marginTop: 32 },
  timerRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  timerText: {
    fontSize: 48,
    fontWeight: "300",
    fontVariant: ["tabular-nums"],
    letterSpacing: 1,
  },
  startedAt: { fontSize: 13, marginTop: 6 },
  notesInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    marginTop: 28,
    minHeight: 56,
    textAlignVertical: "top",
  },
  controls: { flex: 1, justifyContent: "center", alignItems: "center" },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 44,
    borderRadius: 28,
  },
  stopBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 44,
    borderRadius: 28,
  },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "700", marginLeft: 8 },
});
