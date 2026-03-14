import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface DateSelectorProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export function DateSelector({ date, onDateChange }: DateSelectorProps) {
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
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePrevDay} style={styles.arrowButton} accessibilityLabel="Previous day">
        <MaterialIcons name="chevron-left" size={28} color="#2196F3" />
      </TouchableOpacity>

      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{formatDate()}</Text>
      </View>

      <TouchableOpacity onPress={handleNextDay} style={styles.arrowButton} accessibilityLabel="Next day">
        <MaterialIcons name="chevron-right" size={28} color="#2196F3" />
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
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  arrowButton: {
    padding: 8,
  },
  dateContainer: {
    flex: 1,
    alignItems: "center",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212121",
  },
  subText: {
    fontSize: 14,
    color: "#757575",
    marginTop: 2,
  },
});
