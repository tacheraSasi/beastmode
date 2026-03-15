import { TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { View, Text, useColors } from "@/components/Themed";
import Colors from "@/constants/Colors";

interface DateSelectorProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export function DateSelector({ date, onDateChange }: DateSelectorProps) {
  const c = useColors();

  const formatDate = () => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handlePrevDay = () => {
    const previousDay = date.setDate(date.getDate() - 1);
    onDateChange(new Date(previousDay));
  };

  const handleNextDay = () => {
    const nextDay = date.setDate(date.getDate() + 1);
    onDateChange(new Date(nextDay));
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: c.card, borderColor: c.border },
      ]}
    >
      <TouchableOpacity
        onPress={handlePrevDay}
        style={styles.arrowButton}
        accessibilityLabel="Previous day"
        activeOpacity={0.7}
      >
        <MaterialIcons name="chevron-left" size={28} color={Colors.accent} />
      </TouchableOpacity>

      <View style={[styles.dateContainer, { backgroundColor: "transparent" }]}>
        <Text style={[styles.dateText, { color: c.text }]}>{formatDate()}</Text>
      </View>

      <TouchableOpacity
        onPress={handleNextDay}
        style={styles.arrowButton}
        accessibilityLabel="Next day"
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
  dateContainer: {
    flex: 1,
    alignItems: "center",
  },
  dateText: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
});
