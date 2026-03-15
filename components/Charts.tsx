import React from "react";
import { Dimensions, StyleSheet, View as RNView } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { useColors } from "./Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "./useColorScheme";

const screenWidth = Dimensions.get("window").width;

interface MiniLineChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  suffix?: string;
}

export function MiniLineChart({
  data,
  labels,
  height = 180,
  suffix = "",
}: MiniLineChartProps) {
  const c = useColors();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  if (data.length === 0) return null;

  return (
    <RNView style={styles.chartWrap}>
      <LineChart
        data={{
          labels: labels ?? data.map(() => ""),
          datasets: [{ data: data.length > 0 ? data : [0] }],
        }}
        width={screenWidth - 56}
        height={height}
        yAxisSuffix={suffix}
        chartConfig={{
          backgroundColor: "transparent",
          backgroundGradientFrom: c.card,
          backgroundGradientTo: c.card,
          decimalPlaces: 1,
          color: () => Colors.accent,
          labelColor: () => c.textMuted,
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: Colors.accent,
            fill: isDark ? "#111" : "#fff",
          },
          propsForBackgroundLines: {
            stroke: c.border,
            strokeDasharray: "4 4",
          },
          style: { borderRadius: 12 },
        }}
        bezier
        style={styles.chart}
        withInnerLines
        withOuterLines={false}
        withVerticalLines={false}
      />
    </RNView>
  );
}

interface MiniBarChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  suffix?: string;
}

export function MiniBarChart({
  data,
  labels,
  height = 180,
  suffix = "",
}: MiniBarChartProps) {
  const c = useColors();
  const scheme = useColorScheme();

  if (data.length === 0) return null;

  return (
    <RNView style={styles.chartWrap}>
      <BarChart
        data={{
          labels: labels ?? data.map(() => ""),
          datasets: [{ data: data.length > 0 ? data : [0] }],
        }}
        width={screenWidth - 56}
        height={height}
        yAxisSuffix={suffix}
        yAxisLabel=""
        chartConfig={{
          backgroundColor: "transparent",
          backgroundGradientFrom: c.card,
          backgroundGradientTo: c.card,
          decimalPlaces: 0,
          color: () => Colors.accent,
          labelColor: () => c.textMuted,
          barPercentage: 0.6,
          propsForBackgroundLines: {
            stroke: c.border,
            strokeDasharray: "4 4",
          },
          style: { borderRadius: 12 },
        }}
        style={styles.chart}
        withInnerLines
        showValuesOnTopOfBars={false}
      />
    </RNView>
  );
}

const styles = StyleSheet.create({
  chartWrap: { alignItems: "center", marginVertical: 4 },
  chart: { borderRadius: 12, marginLeft: -8 },
});
