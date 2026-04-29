import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { View, Text, useColors } from "@/components/Themed";
import Colors from "@/constants/Colors";
import * as Haptics from "expo-haptics";
import { useAudioPlayer } from "expo-audio";

const alertSound = require("@/assets/alert.mp3");

export type PomodoroPhase = "work" | "shortBreak" | "longBreak";

export interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: true,
  autoStartWork: false,
};

const PRESET_OPTIONS: { label: string; settings: Partial<PomodoroSettings> }[] =
  [
    { label: "Classic (25/5)", settings: { workMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15 } },
    { label: "Short (15/3)", settings: { workMinutes: 15, shortBreakMinutes: 3, longBreakMinutes: 10 } },
    { label: "Long (50/10)", settings: { workMinutes: 50, shortBreakMinutes: 10, longBreakMinutes: 30 } },
  ];

interface PomodoroTimerProps {
  goalName: string;
  goalIcon: string;
  onSessionComplete?: (totalWorkSeconds: number, completedPomodoros: number) => void;
  onPhaseChange?: (phase: PomodoroPhase) => void;
}

export default function PomodoroTimer({
  goalName,
  goalIcon,
  onSessionComplete,
  onPhaseChange,
}: PomodoroTimerProps) {
  const c = useColors();
  const player = useAudioPlayer(alertSound);

  const [settings, setSettings] = useState<PomodoroSettings>(
    DEFAULT_POMODORO_SETTINGS,
  );
  const [phase, setPhase] = useState<PomodoroPhase>("work");
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(
    settings.workMinutes * 60,
  );
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [totalWorkSeconds, setTotalWorkSeconds] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const getPhaseDuration = useCallback(
    (p: PomodoroPhase) => {
      switch (p) {
        case "work":
          return settings.workMinutes * 60;
        case "shortBreak":
          return settings.shortBreakMinutes * 60;
        case "longBreak":
          return settings.longBreakMinutes * 60;
      }
    },
    [settings],
  );

  // Pulse animation during breaks
  useEffect(() => {
    if (isRunning && phase !== "work") {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning, phase, pulseAnim]);

  // Timer countdown
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            handlePhaseComplete();
            return 0;
          }
          // Track work time
          if (phase === "work") {
            setTotalWorkSeconds((t) => t + 1);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, phase]);

  const handlePhaseComplete = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);

    // Play alert sound and haptic
    player.seekTo(0);
    player.play();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (phase === "work") {
      const newCompleted = completedPomodoros + 1;
      setCompletedPomodoros(newCompleted);

      // Determine next break type
      const isLongBreak =
        newCompleted % settings.sessionsBeforeLongBreak === 0;
      const nextPhase: PomodoroPhase = isLongBreak
        ? "longBreak"
        : "shortBreak";
      setPhase(nextPhase);
      setRemainingSeconds(getPhaseDuration(nextPhase));
      onPhaseChange?.(nextPhase);

      if (settings.autoStartBreaks) {
        setIsRunning(true);
      }
    } else {
      // Break is over, start work
      setPhase("work");
      setRemainingSeconds(getPhaseDuration("work"));
      onPhaseChange?.("work");

      if (settings.autoStartWork) {
        setIsRunning(true);
      }
    }
  };

  const handleStartPause = () => {
    if (isRunning) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsRunning(false);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setPhase("work");
    setRemainingSeconds(settings.workMinutes * 60);
    setCompletedPomodoros(0);
    setTotalWorkSeconds(0);
    onPhaseChange?.("work");
  };

  const handleSkipPhase = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handlePhaseComplete();
  };

  const handleFinishSession = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    player.seekTo(0);
    player.play();
    onSessionComplete?.(totalWorkSeconds, completedPomodoros);
  };

  const applyPreset = (preset: Partial<PomodoroSettings>) => {
    const newSettings = { ...settings, ...preset };
    setSettings(newSettings);
    if (!isRunning) {
      setPhase("work");
      setRemainingSeconds(newSettings.workMinutes * 60);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getPhaseColor = () => {
    switch (phase) {
      case "work":
        return Colors.accent;
      case "shortBreak":
        return c.success;
      case "longBreak":
        return "#1565C0";
    }
  };

  const getPhaseLabel = () => {
    switch (phase) {
      case "work":
        return "🔥 Focus Time";
      case "shortBreak":
        return "☕ Short Break";
      case "longBreak":
        return "🌿 Long Break";
    }
  };

  const progress =
    1 - remainingSeconds / getPhaseDuration(phase);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Goal info */}
      <View style={[styles.goalInfo, { backgroundColor: "transparent" }]}>
        <View style={[styles.iconWrap, { backgroundColor: c.surfaceAlt }]}>
          <Text style={styles.icon}>{goalIcon}</Text>
        </View>
        <Text style={[styles.goalName, { color: c.text }]}>{goalName}</Text>
      </View>

      {/* Phase indicator */}
      <View
        style={[
          styles.phaseIndicator,
          { backgroundColor: getPhaseColor() + "18" },
        ]}
      >
        <Text style={[styles.phaseLabel, { color: getPhaseColor() }]}>
          {getPhaseLabel()}
        </Text>
      </View>

      {/* Timer ring */}
      <View
        style={[styles.timerContainer, { backgroundColor: "transparent" }]}
      >
        <Animated.View
          style={[
            styles.timerRing,
            {
              borderColor: isRunning ? getPhaseColor() : c.surfaceAlt,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          {/* Progress background */}
          <View
            style={[
              styles.progressOverlay,
              {
                backgroundColor: getPhaseColor() + "10",
                height: `${progress * 100}%` as `${number}%`,
              },
            ]}
          />
          <Text style={[styles.timerText, { color: c.text }]}>
            {formatTime(remainingSeconds)}
          </Text>
          <Text style={[styles.phaseSubtext, { color: c.textMuted }]}>
            {phase === "work" ? "Stay focused" : "Take a breather"}
          </Text>
        </Animated.View>
      </View>

      {/* Pomodoro counter */}
      <View style={[styles.counterRow, { backgroundColor: "transparent" }]}>
        {Array.from({ length: settings.sessionsBeforeLongBreak }).map(
          (_, i) => (
            <View
              key={i}
              style={[
                styles.counterDot,
                {
                  backgroundColor:
                    i < completedPomodoros % settings.sessionsBeforeLongBreak ||
                    (completedPomodoros > 0 &&
                      completedPomodoros % settings.sessionsBeforeLongBreak ===
                        0 &&
                      i < settings.sessionsBeforeLongBreak)
                      ? Colors.accent
                      : c.surfaceAlt,
                },
              ]}
            />
          ),
        )}
        {completedPomodoros > 0 && (
          <Text style={[styles.counterText, { color: c.textMuted }]}>
            {completedPomodoros} 🍅
          </Text>
        )}
      </View>

      {/* Stats row */}
      {totalWorkSeconds > 0 && (
        <View style={[styles.statsRow, { backgroundColor: "transparent" }]}>
          <View
            style={[styles.statItem, { backgroundColor: c.surfaceAlt }]}
          >
            <Text style={[styles.statValue, { color: c.text }]}>
              {Math.floor(totalWorkSeconds / 60)}m
            </Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>
              Total focus
            </Text>
          </View>
          <View
            style={[styles.statItem, { backgroundColor: c.surfaceAlt }]}
          >
            <Text style={[styles.statValue, { color: c.text }]}>
              {completedPomodoros}
            </Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>
              Pomodoros
            </Text>
          </View>
        </View>
      )}

      {/* Controls */}
      <View style={[styles.controls, { backgroundColor: "transparent" }]}>
        <View
          style={[styles.controlRow, { backgroundColor: "transparent" }]}
        >
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: c.surfaceAlt }]}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <MaterialIcons name="refresh" size={22} color={c.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.mainBtn,
              { backgroundColor: getPhaseColor() },
            ]}
            onPress={handleStartPause}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={isRunning ? "pause" : "play-arrow"}
              size={32}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: c.surfaceAlt }]}
            onPress={handleSkipPhase}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="skip-next"
              size={22}
              color={c.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Finish / Settings buttons */}
        <View
          style={[styles.bottomActions, { backgroundColor: "transparent" }]}
        >
          {completedPomodoros > 0 && (
            <TouchableOpacity
              style={[styles.finishBtn, { backgroundColor: c.success }]}
              onPress={handleFinishSession}
              activeOpacity={0.8}
            >
              <MaterialIcons name="check" size={20} color="#fff" />
              <Text style={styles.finishBtnText}>
                Finish ({completedPomodoros} 🍅)
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.settingsToggle, { backgroundColor: "transparent" }]}
            onPress={() => setShowSettings(!showSettings)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="tune"
              size={18}
              color={c.textMuted}
            />
            <Text style={[styles.settingsToggleText, { color: c.textMuted }]}>
              {showSettings ? "Hide Settings" : "Timer Settings"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings panel */}
      {showSettings && (
        <View
          style={[
            styles.settingsPanel,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <Text style={[styles.settingsTitle, { color: c.text }]}>
            Pomodoro Settings
          </Text>

          {/* Presets */}
          <View
            style={[styles.presetsRow, { backgroundColor: "transparent" }]}
          >
            {PRESET_OPTIONS.map((preset) => {
              const isActive =
                settings.workMinutes === preset.settings.workMinutes &&
                settings.shortBreakMinutes ===
                  preset.settings.shortBreakMinutes;
              return (
                <TouchableOpacity
                  key={preset.label}
                  style={[
                    styles.presetBtn,
                    {
                      backgroundColor: isActive
                        ? Colors.accent
                        : c.surfaceAlt,
                    },
                  ]}
                  onPress={() => applyPreset(preset.settings)}
                  disabled={isRunning}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.presetText,
                      { color: isActive ? "#fff" : c.text },
                    ]}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Duration settings */}
          <View
            style={[
              styles.settingRow,
              { backgroundColor: "transparent" },
            ]}
          >
            <Text style={[styles.settingLabel, { color: c.text }]}>
              🔥 Work
            </Text>
            <View
              style={[
                styles.settingControl,
                { backgroundColor: "transparent" },
              ]}
            >
              <TouchableOpacity
                onPress={() => {
                  if (settings.workMinutes > 5) {
                    const newVal = settings.workMinutes - 5;
                    setSettings({ ...settings, workMinutes: newVal });
                    if (!isRunning && phase === "work")
                      setRemainingSeconds(newVal * 60);
                  }
                }}
                disabled={isRunning}
                style={[styles.adjustBtn, { backgroundColor: c.surfaceAlt }]}
              >
                <MaterialIcons name="remove" size={18} color={c.text} />
              </TouchableOpacity>
              <Text style={[styles.settingValue, { color: c.text }]}>
                {settings.workMinutes}m
              </Text>
              <TouchableOpacity
                onPress={() => {
                  const newVal = settings.workMinutes + 5;
                  setSettings({ ...settings, workMinutes: newVal });
                  if (!isRunning && phase === "work")
                    setRemainingSeconds(newVal * 60);
                }}
                disabled={isRunning}
                style={[styles.adjustBtn, { backgroundColor: c.surfaceAlt }]}
              >
                <MaterialIcons name="add" size={18} color={c.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={[
              styles.settingRow,
              { backgroundColor: "transparent" },
            ]}
          >
            <Text style={[styles.settingLabel, { color: c.text }]}>
              ☕ Short Break
            </Text>
            <View
              style={[
                styles.settingControl,
                { backgroundColor: "transparent" },
              ]}
            >
              <TouchableOpacity
                onPress={() => {
                  if (settings.shortBreakMinutes > 1) {
                    const newVal = settings.shortBreakMinutes - 1;
                    setSettings({ ...settings, shortBreakMinutes: newVal });
                    if (!isRunning && phase === "shortBreak")
                      setRemainingSeconds(newVal * 60);
                  }
                }}
                disabled={isRunning}
                style={[styles.adjustBtn, { backgroundColor: c.surfaceAlt }]}
              >
                <MaterialIcons name="remove" size={18} color={c.text} />
              </TouchableOpacity>
              <Text style={[styles.settingValue, { color: c.text }]}>
                {settings.shortBreakMinutes}m
              </Text>
              <TouchableOpacity
                onPress={() => {
                  const newVal = settings.shortBreakMinutes + 1;
                  setSettings({ ...settings, shortBreakMinutes: newVal });
                  if (!isRunning && phase === "shortBreak")
                    setRemainingSeconds(newVal * 60);
                }}
                disabled={isRunning}
                style={[styles.adjustBtn, { backgroundColor: c.surfaceAlt }]}
              >
                <MaterialIcons name="add" size={18} color={c.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={[
              styles.settingRow,
              { backgroundColor: "transparent" },
            ]}
          >
            <Text style={[styles.settingLabel, { color: c.text }]}>
              🌿 Long Break
            </Text>
            <View
              style={[
                styles.settingControl,
                { backgroundColor: "transparent" },
              ]}
            >
              <TouchableOpacity
                onPress={() => {
                  if (settings.longBreakMinutes > 5) {
                    const newVal = settings.longBreakMinutes - 5;
                    setSettings({ ...settings, longBreakMinutes: newVal });
                    if (!isRunning && phase === "longBreak")
                      setRemainingSeconds(newVal * 60);
                  }
                }}
                disabled={isRunning}
                style={[styles.adjustBtn, { backgroundColor: c.surfaceAlt }]}
              >
                <MaterialIcons name="remove" size={18} color={c.text} />
              </TouchableOpacity>
              <Text style={[styles.settingValue, { color: c.text }]}>
                {settings.longBreakMinutes}m
              </Text>
              <TouchableOpacity
                onPress={() => {
                  const newVal = settings.longBreakMinutes + 5;
                  setSettings({ ...settings, longBreakMinutes: newVal });
                  if (!isRunning && phase === "longBreak")
                    setRemainingSeconds(newVal * 60);
                }}
                disabled={isRunning}
                style={[styles.adjustBtn, { backgroundColor: c.surfaceAlt }]}
              >
                <MaterialIcons name="add" size={18} color={c.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Auto-start toggles */}
          <TouchableOpacity
            style={[
              styles.toggleRow,
              { backgroundColor: "transparent" },
            ]}
            onPress={() =>
              setSettings({
                ...settings,
                autoStartBreaks: !settings.autoStartBreaks,
              })
            }
            activeOpacity={0.7}
          >
            <Text style={[styles.settingLabel, { color: c.text }]}>
              Auto-start breaks
            </Text>
            <MaterialIcons
              name={
                settings.autoStartBreaks
                  ? "check-box"
                  : "check-box-outline-blank"
              }
              size={22}
              color={settings.autoStartBreaks ? Colors.accent : c.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleRow,
              { backgroundColor: "transparent" },
            ]}
            onPress={() =>
              setSettings({
                ...settings,
                autoStartWork: !settings.autoStartWork,
              })
            }
            activeOpacity={0.7}
          >
            <Text style={[styles.settingLabel, { color: c.text }]}>
              Auto-start work sessions
            </Text>
            <MaterialIcons
              name={
                settings.autoStartWork
                  ? "check-box"
                  : "check-box-outline-blank"
              }
              size={22}
              color={settings.autoStartWork ? Colors.accent : c.textMuted}
            />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
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
  phaseIndicator: {
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  phaseLabel: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  timerContainer: { alignItems: "center", marginTop: 24 },
  timerRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  progressOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  timerText: {
    fontSize: 48,
    fontWeight: "300",
    fontVariant: ["tabular-nums"],
    letterSpacing: 1,
  },
  phaseSubtext: { fontSize: 13, marginTop: 4 },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 8,
  },
  counterDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  counterText: { fontSize: 14, fontWeight: "600", marginLeft: 4 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 16,
  },
  statItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 100,
  },
  statValue: { fontSize: 20, fontWeight: "700" },
  statLabel: { fontSize: 12, marginTop: 2 },
  controls: { marginTop: 24 },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  mainBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomActions: {
    alignItems: "center",
    marginTop: 16,
    gap: 10,
  },
  finishBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 22,
    gap: 6,
  },
  finishBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  settingsToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 6,
  },
  settingsToggleText: { fontSize: 14, fontWeight: "600" },
  settingsPanel: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  settingsTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  presetsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  presetText: { fontSize: 13, fontWeight: "600" },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  settingLabel: { fontSize: 15, fontWeight: "600" },
  settingControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingValue: { fontSize: 16, fontWeight: "700", minWidth: 40, textAlign: "center" },
  adjustBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
});
