import { TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { View, Text, useColors } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { addMonths } from "@/utils/month";

interface MonthSelectorProps {
  month: Date;
  onMonthChange: (month: Date) => void;
}

export function MonthSelector({ month, onMonthChange }: MonthSelectorProps) {
  const c = useColors();

  const formatMonth = () =>
    month.toLocaleString("en-US", { month: "long", year: "numeric" });

  const handlePrev = () => onMonthChange(addMonths(month, -1));
  const handleNext = () => onMonthChange(addMonths(month, 1));

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: c.card, borderColor: c.border },
      ]}
    >
      <TouchableOpacity
        onPress={handlePrev}
        style={styles.arrowButton}
        accessibilityLabel="Previous month"
        activeOpacity={0.7}
      >
        <MaterialIcons name="chevron-left" size={28} color={Colors.accent} />
      </TouchableOpacity>

      <View style={[styles.monthContainer, { backgroundColor: "transparent" }]}>
        <Text style={[styles.monthText, { color: c.text }]}>
          {formatMonth()}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleNext}
        style={styles.arrowButton}
        accessibilityLabel="Next month"
        activeOpacity={0.7}
      >
        <MaterialIcons name="chevron-right" size={28} color={Colors.accent} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  arrowButton: {
    padding: 6,
  },
  monthContainer: {
    flex: 1,
    alignItems: "center",
  },
  monthText: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
});

